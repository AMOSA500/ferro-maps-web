import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { Search, RotateCcw, AlertTriangle } from 'lucide-react'
import { db } from '../lib/firebase'
import { submitAccountAction } from '../lib/accountActions'
import AppShell from '../components/AppShell'

interface DriverRecord {
  uid: string
  name: string
  email: string
  ferroBalance: number
  xp: number
  level: number
  dayStreak: number
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-green-600',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
]

function avatarColor(name: string): string {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

export default function Settings() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [resettingUid, setResettingUid] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('name'))

    const unsub = onSnapshot(q, (snapshot) => {
      const list: DriverRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data()
        return {
          uid: d.uid ?? docSnap.id,
          name: d.name ?? '',
          email: d.email ?? '',
          ferroBalance: typeof d.ferroBalance === 'number' ? d.ferroBalance : 0,
          xp: typeof d.xp === 'number' ? d.xp : 0,
          level: typeof d.level === 'number' ? d.level : 1,
          dayStreak: typeof d.dayStreak === 'number' ? d.dayStreak : 0,
        }
      })
      setDrivers(list)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const filtered = drivers.filter((d) => {
    const q = search.trim().toLowerCase()
    return !q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
  })

  async function handleResetStats(driver: DriverRecord) {
    const confirmed = window.confirm(
      `Reset ${driver.name}'s stats?\n\n` +
        `This sets their Ferro balance, XP, and day streak back to 0, resets their level to 1, ` +
        `and permanently deletes their earning history. This cannot be undone.`,
    )
    if (!confirmed) return

    setResettingUid(driver.uid)
    try {
      await submitAccountAction('resetStats', driver.uid)
    } catch (error) {
      console.error('Failed to reset driver stats:', error)
      alert('Could not reset this account. Please try again.')
    } finally {
      setResettingUid(null)
    }
  }

  return (
    <AppShell title="Settings">
      <div className="flex flex-col gap-6">

        {/* Header row */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-card px-4 py-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Resetting a driver's stats permanently deletes their earning history and cannot be undone.
            Double-check you have the right driver before confirming.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-button border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ferro-primary"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-gray-200 shadow-md overflow-hidden">
          <p className="md:hidden text-xs text-gray-400 px-4 pt-3">Swipe to see more</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Ferro balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">XP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Day streak</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
                        <div className="h-3 w-32 bg-neutral-200 animate-pulse rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-3 w-16 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-12 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-10 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-10 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-24 bg-neutral-200 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 text-center text-text-secondary">
                      {search ? 'No drivers match your search' : 'No drivers found'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((driver) => (
                  <tr key={driver.uid} className="border-b border-gray-200 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor(driver.name)}`}>
                          <span className="text-white text-xs font-semibold">{getInitials(driver.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate">{driver.name}</p>
                          <p className="text-xs text-text-tertiary truncate">{driver.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ferro-primary">{driver.ferroBalance.toLocaleString()} F</td>
                    <td className="px-4 py-3">{driver.xp.toLocaleString()} XP</td>
                    <td className="px-4 py-3">Lvl {driver.level}</td>
                    <td className="px-4 py-3">{driver.dayStreak}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleResetStats(driver)}
                        disabled={resettingUid === driver.uid}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <RotateCcw size={13} />
                        {resettingUid === driver.uid ? 'Resetting…' : 'Reset stats'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
