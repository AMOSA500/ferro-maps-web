import {onSchedule} from "firebase-functions/v2/scheduler";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {LONDON_TZ} from "./london";
import {buildWeeklyReport, type WeeklyReport} from "./weeklyReport";

/**
 * Monday morning, 07:00 London: the week in Slack.
 *
 * Posted through an incoming webhook held in Secret Manager, so the URL is
 * never in the repository and rotating it needs no code change.
 *
 * The report is also written to Firestore, both as a record and because next
 * Monday reads it to work out which of last week's problems were dealt with.
 */

const slackWebhook = defineSecret("SLACK_WEEKLY_REPORT_WEBHOOK");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "6 Oct" from a YYYY-MM-DD day key.
 * @param {string} dayKey the day to render.
 * @return {string} a short human date.
 */
function shortDate(dayKey: string): string {
  const [, month, day] = dayKey.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/**
 * The report as Slack Block Kit.
 *
 * Headline figures go in a two-column field list, which Slack renders as an
 * aligned grid on desktop and stacks on a phone — the one layout that stays
 * readable in both without drawing a table in a code block.
 * @param {WeeklyReport} report what to render.
 * @return {object[]} Slack blocks.
 */
export function toSlackBlocks(report: WeeklyReport): object[] {
  const blocks: object[] = [
    {
      type: "header",
      text: {type: "plain_text", text: "Ferro Maps — week in review", emoji: true},
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*${shortDate(report.weekStart)} – ${shortDate(report.weekEnd)}*  ·  <https://admin.ferromaps.com|open the admin>`,
        },
      ],
    },
    {type: "divider"},
    {
      type: "section",
      fields: report.headline.map((figure) => ({
        type: "mrkdwn",
        text: `*${figure.value}*${figure.change ? `  ${figure.change}` : ""}\n${figure.label}`,
      })),
    },
  ];

  if (report.working.length > 0) {
    blocks.push(
      {type: "divider"},
      {type: "section", text: {type: "mrkdwn", text: "*:white_check_mark:  Working well*"}},
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: report.working
            .map((item) => `• *${item.title}*${item.detail ? `\n   ${item.detail}` : ""}`)
            .join("\n"),
        },
      }
    );
  }

  if (report.attention.length > 0) {
    blocks.push(
      {type: "divider"},
      {type: "section", text: {type: "mrkdwn", text: "*:warning:  Needs attention*"}},
      ...report.attention.map((item, index) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*${index + 1}. ${item.title}*\n${item.detail}` +
            `${item.action ? `\n→ _${item.action}_` : ""}`,
        },
      }))
    );
  }

  if (report.lastWeek.fixed.length > 0 || report.lastWeek.stillOpen.length > 0) {
    const lines = [
      ...report.lastWeek.fixed.map((title) => `:white_check_mark:  Fixed — ${title}`),
      ...report.lastWeek.stillOpen.map(
        (item) => `:hourglass_flowing_sand:  Still open — ${item.title} (${item.weeks} weeks running)`
      ),
    ];
    blocks.push(
      {type: "divider"},
      {type: "section", text: {type: "mrkdwn", text: `*Last week's actions*\n${lines.join("\n")}`}}
    );
  }

  if (report.watching.length > 0) {
    blocks.push({
      type: "context",
      elements: [{type: "mrkdwn", text: `*Watching*  ·  ${report.watching.join("  ·  ")}`}],
    });
  }

  return blocks;
}

/**
 * Plain text for notifications and anywhere blocks do not render.
 * @param {WeeklyReport} report what to summarise.
 * @return {string} one line naming the week and its headline figures.
 */
export function toSlackText(report: WeeklyReport): string {
  const headline = report.headline.map((f) => `${f.label}: ${f.value}`).join(" · ");
  const attention = report.attention.length > 0 ? ` — ${report.attention.length} needing attention` : "";
  return `Ferro Maps week in review (${shortDate(report.weekStart)}–${shortDate(report.weekEnd)}): ${headline}${attention}`;
}

export const sendWeeklyReport = onSchedule(
  {
    schedule: "0 7 * * 1",
    timeZone: LONDON_TZ,
    region: "europe-west2",
    secrets: [slackWebhook],
  },
  async () => {
    const db = getFirestore();
    const report = await buildWeeklyReport(db);

    const response = await fetch(slackWebhook.value(), {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({text: toSlackText(report), blocks: toSlackBlocks(report)}),
    });

    if (!response.ok) {
      // Thrown rather than swallowed: a report nobody receives should show up
      // as a failed run, not as silence on a Monday morning.
      throw new Error(`Slack refused the report: ${response.status} ${await response.text()}`);
    }

    // Written after a successful post, so a failed send does not count as a
    // week's worth of "we already told you about that".
    await db.doc(`adminStats/weeklyReport_${report.weekStart}`).set({
      ...report.snapshot,
      builtAt: FieldValue.serverTimestamp(),
      weekEnd: report.weekEnd,
      attentionCount: report.attention.length,
      workingCount: report.working.length,
    });

    logger.info(
      `sendWeeklyReport ${report.weekStart}–${report.weekEnd}: ` +
      `${report.working.length} going well, ${report.attention.length} needing attention, ` +
      `${report.lastWeek.fixed.length} fixed since last week`
    );
  }
);
