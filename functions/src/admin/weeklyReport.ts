import {Firestore, Timestamp} from "firebase-admin/firestore";
import {addDays, londonDayKey} from "./london";
import type {DailyStats, LiveStats} from "./stats";
import type {AlertInsights} from "./alertInsights";
import type {GrowthStats} from "./growth";

/**
 * The Monday report.
 *
 * Everything here is already counted by the nightly rollups; this decides what
 * is worth saying. Two rules keep it honest week to week:
 *
 *   Nothing is praised without a number that moved or a threshold met, so a
 *   flat week reads as flat rather than as good news.
 *
 *   Every attention item carries a stable key. Next Monday's report compares
 *   its keys against last Monday's: what has gone is reported fixed, what
 *   remains carries a count of how many weeks it has been there. An item
 *   nobody deals with gets louder rather than quietly repeating.
 */

/** Drivers stop acting on an alert past this travel time, on the evidence. */
const USEFUL_TRAVEL_MINUTES = 10;

/** A feed quiet for longer than this is a job to go and look at. */
const FEED_STALE_HOURS = 24;

/** Expired pins above this share of the map are worth clearing out. */
const EXPIRED_SHARE = 0.25;

/** The rules' grace period for pre-update app builds. */
const DEVICE_GRACE_ENDS = Date.UTC(2026, 9, 15);

export interface ReportItem {
  /** Stable across weeks, so the next report can tell what was fixed. */
  key: string;
  title: string;
  detail: string;
  /** What to do, named plainly enough to act on. */
  action?: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  headline: {label: string; value: string; change: string | null}[];
  working: ReportItem[];
  attention: ReportItem[];
  watching: string[];
  /** What last week flagged, and whether it is still flagged. */
  lastWeek: {fixed: string[]; stillOpen: {title: string; weeks: number}[]};
  /** Written back so next Monday can do the same comparison. */
  snapshot: {weekStart: string; items: {key: string; title: string; weeks: number}[]};
}

interface WeekTotals {
  newDrivers: number;
  activeOnLastDay: number;
  visits: number;
  jobs: number;
  alertsSent: number;
  alertsActedOn: number;
  alertsChecked: number;
  ticketsOpened: number;
  pins: number;
  waitlist: number;
}

function sum(days: DailyStats[]): WeekTotals {
  const totals: WeekTotals = {
    newDrivers: 0, activeOnLastDay: 0, visits: 0, jobs: 0,
    alertsSent: 0, alertsActedOn: 0, alertsChecked: 0, ticketsOpened: 0, pins: 0, waitlist: 0,
  };
  for (const day of days) {
    totals.newDrivers += day.drivers.new;
    totals.visits += day.outcomes.visits;
    totals.jobs += day.outcomes.jobQuick + day.outcomes.jobSlow;
    totals.alertsSent += day.alerts.sent;
    totals.alertsActedOn += day.alerts.actedOn;
    totals.alertsChecked += day.alerts.checked;
    totals.ticketsOpened += day.support.opened;
    totals.pins += day.community.pinsCreated;
    totals.waitlist += day.growth.waitlistSignups;
  }
  totals.activeOnLastDay = days.length > 0 ? days[days.length - 1].drivers.active : 0;
  return totals;
}

function share(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

/**
 * "▲ 20%", "▼ 4%", "level" — or nothing when last week had no figure.
 * @param {number} now this week's count.
 * @param {number} before last week's count.
 * @return {string | null} the change, or null.
 */
function change(now: number, before: number): string | null {
  if (before === 0) return now > 0 ? "new" : null;
  const delta = Math.round(((now - before) / before) * 100);
  if (delta === 0) return "level";
  return `${delta > 0 ? "▲" : "▼"} ${Math.abs(delta)}%`;
}

/**
 * "▲ 3 pts" for a percentage that moved, or nothing when either is unknown.
 * @param {number | null} now this week's percentage.
 * @param {number | null} before last week's percentage.
 * @return {string | null} the change, or null.
 */
function pointChange(now: number | null, before: number | null): string | null {
  if (now === null || before === null) return null;
  const delta = now - before;
  if (delta === 0) return "level";
  const points = Math.abs(delta);
  return `${delta > 0 ? "▲" : "▼"} ${points} ${points === 1 ? "pt" : "pts"}`;
}

function hoursSince(stamp: Timestamp | null | undefined, now: Date): number | null {
  return stamp ? (now.getTime() - stamp.toMillis()) / 3_600_000 : null;
}

function describeHours(hours: number): string {
  if (hours < 48) return `${Math.round(hours)} hours`;
  return `${Math.floor(hours / 24)} days`;
}

/**
 * Alerts sent to places drivers never travel to, on this month's evidence.
 * @param {AlertInsights | null} insights the alert rollup, if it exists.
 * @return {{wasted: number, sent: number} | null} counts, or null when unknown.
 */
function wastedAlerts(insights: AlertInsights | null): {wasted: number; sent: number} | null {
  if (!insights) return null;
  let wasted = 0;
  for (const [band, split] of Object.entries(insights.byTravel)) {
    // Bands are "<5", "5-10", "10-15" … "30+"; the lower bound is what matters.
    const lower = Number(band.replace("<", "0-").replace("+", "").split("-")[0]);
    if (lower >= USEFUL_TRAVEL_MINUTES && split.actedOn === 0) wasted += split.sent;
  }
  return wasted > 0 ? {wasted, sent: insights.totals.sent} : null;
}

/**
 * Build the week's report from what the nightly rollups already counted.
 * @param {Firestore} db the Admin SDK handle, which rules do not apply to.
 * @param {Date} now the Monday morning it is being built on.
 * @return {Promise<WeeklyReport>} everything the Slack message needs.
 */
export async function buildWeeklyReport(db: Firestore, now = new Date()): Promise<WeeklyReport> {
  const today = londonDayKey(now);
  const weekEnd = addDays(today, -1);
  const weekStart = addDays(today, -7);

  const dayKeys = Array.from({length: 14}, (_, i) => addDays(today, -14 + i));
  const [dailySnaps, liveSnap, insightsSnap, growthSnap, lastReport] = await Promise.all([
    Promise.all(dayKeys.map((key) => db.doc(`adminStats/daily_${key}`).get())),
    db.doc("adminStats/live").get(),
    db.doc("adminStats/alertInsights").get(),
    db.doc("adminStats/growth").get(),
    db.collection("adminStats").where("weekStart", "!=", "").orderBy("weekStart", "desc").limit(1).get(),
  ]);

  const days = dailySnaps.filter((snap) => snap.exists).map((snap) => snap.data() as DailyStats);
  const thisWeek = sum(days.slice(-7));
  const lastWeekDays = sum(days.slice(-14, -7));
  const live = liveSnap.exists ? (liveSnap.data() as LiveStats) : null;
  const insights = insightsSnap.exists ? (insightsSnap.data() as AlertInsights) : null;
  const growth = growthSnap.exists ? (growthSnap.data() as GrowthStats) : null;

  const jobRate = share(thisWeek.jobs, thisWeek.visits);
  const jobRateBefore = share(lastWeekDays.jobs, lastWeekDays.visits);
  const actedRate = share(thisWeek.alertsActedOn, thisWeek.alertsChecked);
  const actedRateBefore = share(lastWeekDays.alertsActedOn, lastWeekDays.alertsChecked);

  const headline = [
    {
      label: "New drivers",
      value: thisWeek.newDrivers.toLocaleString(),
      change: change(thisWeek.newDrivers, lastWeekDays.newDrivers),
    },
    {
      label: "Active yesterday",
      value: thisWeek.activeOnLastDay.toLocaleString(),
      change: change(thisWeek.activeOnLastDay, lastWeekDays.activeOnLastDay),
    },
    {
      label: "Visits → a job",
      value: jobRate === null ? "—" : `${jobRate}%`,
      change: pointChange(jobRate, jobRateBefore),
    },
    {
      label: "Alerts acted on",
      value: actedRate === null ? "—" : `${actedRate}%`,
      change: pointChange(actedRate, actedRateBefore),
    },
    {
      label: "Visits logged",
      value: thisWeek.visits.toLocaleString(),
      change: change(thisWeek.visits, lastWeekDays.visits),
    },
    {
      label: "Waiting on us",
      value: live ? live.tickets.waitingOnUs.toLocaleString() : "—",
      change: null,
    },
  ];

  // --- what is going well, each needing a number behind it
  const working: ReportItem[] = [];

  if (thisWeek.newDrivers > lastWeekDays.newDrivers * 1.05) {
    working.push({
      key: "growth-up",
      title: `${thisWeek.newDrivers} drivers joined, up from ${lastWeekDays.newDrivers}`,
      detail: growth ? `${growth.drivers.total.toLocaleString()} drivers in total.` : "",
    });
  }

  if (jobRate !== null && jobRate >= 60) {
    working.push({
      key: "job-rate",
      title: `${jobRate}% of visits ended in a job`,
      detail: `Across ${thisWeek.visits} visits. The product delivers when drivers turn up.`,
    });
  }

  if (live && live.tickets.waitingOnUs === 0) {
    working.push({
      key: "support-clear",
      title: "Nobody is waiting on a reply",
      detail: `${live.tickets.open} tickets open, all answered.`,
    });
  }

  const claimedShare = live ? share(live.drivers.deviceClaimed, live.drivers.total) : null;
  if (claimedShare !== null && claimedShare >= 90 && now.getTime() < DEVICE_GRACE_ENDS) {
    working.push({
      key: "device-rollout-good",
      title: `${claimedShare}% of drivers are on the current app build`,
      detail: `${live?.drivers.deviceClaimed.toLocaleString()} of ${live?.drivers.total.toLocaleString()}.`,
    });
  }

  if (thisWeek.pins > 0) {
    working.push({
      key: "contributions",
      title: `${thisWeek.pins} pins added by drivers`,
      detail: "Parking bays and eggs the feeds could never have found.",
    });
  }

  // --- what needs attention, worst first
  const attention: ReportItem[] = [];

  const wasted = wastedAlerts(insights);
  if (wasted) {
    const wastedShare = share(wasted.wasted, wasted.sent);
    attention.push({
      key: "alerts-too-far",
      title: `Alerts are still going too far — ${actedRate ?? 0}% acted on`,
      detail:
        `${wasted.wasted} of ${wasted.sent} alerts (${wastedShare}%) went to places over ` +
        `${USEFUL_TRAVEL_MINUTES} minutes away, where not one driver has ever gone.`,
      action: "Cap alert distance in the apps.",
    });
  }

  for (const [category, feed] of Object.entries(live?.hotspots.feeds ?? {})) {
    const hours = hoursSince(feed.lastFetchedAt, now);
    if (hours !== null && hours > FEED_STALE_HOURS) {
      attention.push({
        key: `feed-stale:${category}`,
        title: `The ${category} feed has been silent for ${describeHours(hours)}`,
        detail: "Other feeds are arriving normally.",
        action: "Check the Cloud Run job that fills it.",
      });
    }
  }

  if (live && live.hotspots.total > 0 && live.hotspots.expired / live.hotspots.total > EXPIRED_SHARE) {
    const expiredShare = share(live.hotspots.expired, live.hotspots.total);
    attention.push({
      key: "expired-hotspots",
      title: `${expiredShare}% of the map has expired`,
      detail: `${live.hotspots.expired.toLocaleString()} of ${live.hotspots.total.toLocaleString()} pins are past their expiry but still stored and read.`,
      action: "Needs a cleanup job.",
    });
  }

  if (live && claimedShare !== null && claimedShare < 98 && now.getTime() < DEVICE_GRACE_ENDS) {
    const stranded = live.drivers.total - live.drivers.deviceClaimed;
    const days = Math.ceil((DEVICE_GRACE_ENDS - now.getTime()) / 86_400_000);
    attention.push({
      key: "device-rollout",
      title: `${stranded.toLocaleString()} drivers would lose access in ${days} days`,
      detail: "They are still on the old app build, which stops being allowed to write on 15 October.",
      action: "Chase the update, or extend the grace period deliberately.",
    });
  }

  if (live && live.tickets.waitingOnUsOverDay > 0) {
    attention.push({
      key: "tickets-waiting",
      title: `${live.tickets.waitingOnUsOverDay} tickets have waited over a day`,
      detail: "The driver wrote last and nobody has replied.",
      action: "Clear them on the Support page.",
    });
  }

  for (const [name, queue] of Object.entries(live?.queues ?? {})) {
    if (queue.oldestMinutes !== null && queue.oldestMinutes > 30) {
      attention.push({
        key: `queue-stuck:${name}`,
        title: `${queue.pending} requests stuck in ${name}`,
        detail: `The oldest has waited ${Math.round(queue.oldestMinutes)} minutes.`,
        action: "A background job has probably stopped.",
      });
    }
  }

  // --- quieter things worth keeping an eye on
  const watching: string[] = [];

  if (live && live.drivers.flaggedOnline > live.drivers.online * 3) {
    watching.push(
      `${live.drivers.flaggedOnline.toLocaleString()} accounts claim to be online; ` +
      `${live.drivers.online.toLocaleString()} really are. The apps do not clear the flag when killed.`
    );
  }
  if (growth) {
    const conversion = share(growth.waitlist.converted, growth.waitlist.total);
    watching.push(`Waitlist → driver conversion: ${conversion ?? 0}%.`);
    watching.push(growth.premium.active > 0 ?
      `Premium subscribers: ${growth.premium.active}.` :
      "Premium: still nobody subscribed.");
  }

  // --- what last week flagged
  const previous = lastReport.docs[0]?.data() as
    | {weekStart: string; items: {key: string; title: string; weeks: number}[]}
    | undefined;
  const currentKeys = new Set(attention.map((item) => item.key));
  const fixed = (previous?.items ?? []).filter((item) => !currentKeys.has(item.key)).map((item) => item.title);
  const snapshotItems = attention.map((item) => {
    const before = previous?.items.find((previousItem) => previousItem.key === item.key);
    return {key: item.key, title: item.title, weeks: (before?.weeks ?? 0) + 1};
  });
  const stillOpen = snapshotItems
    .filter((item) => item.weeks > 1)
    .map((item) => ({title: item.title, weeks: item.weeks}));

  return {
    weekStart,
    weekEnd,
    headline,
    working,
    attention,
    watching,
    lastWeek: {fixed, stillOpen},
    snapshot: {weekStart, items: snapshotItems},
  };
}
