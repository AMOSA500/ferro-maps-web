import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { Search, Star } from 'lucide-react'
import { db } from '../lib/firebase'
import { getLevelProgress } from '../lib/levelThresholds'
import AppShell from '../components/AppShell'

interface DriverStats {
  uid: string
  name: string
  email: string
  xp: number
  isOnline: boolean
  isSuspended: boolean
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

export default function Rankings() {
  const [drivers, setDrivers] = useState<DriverStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('name'))

    const unsub = onSnapshot(q, (snapshot) => {
      const list: DriverStats[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data()
        return {
          uid: d.uid ?? docSnap.id,
          name: d.name ?? '',
          email: d.email ?? '',
          xp: typeof d.xp === 'number' ? d.xp : 0,
          isOnline: d.isOnline ?? false,
          isSuspended: d.isSuspended ?? false,
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

  return (
    <AppShell title="Driver XP">
      <div className="flex flex-col gap-6">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-ferro-signal" />
            <p className="text-sm text-text-secondary">
              Look up a driver's XP and current level
            </p>
          </div>
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
            <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">XP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Progress to next level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Status</th>
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
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-12 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-32 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-neutral-200 animate-pulse rounded-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="py-16 text-center text-text-secondary">
                      {search ? 'No drivers match your search' : 'No drivers found'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((driver) => {
                  const progress = getLevelProgress(driver.xp)
                  return (
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
                      <td className="px-4 py-3">
                        <span className="font-semibold text-text-primary">Lvl {progress.current.level}</span>
                        <span className="text-text-secondary"> · {progress.current.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ferro-primary">{driver.xp.toLocaleString()} XP</span>
                      </td>
                      <td className="px-4 py-3">
                        {progress.next ? (
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                              <div
                                className="h-full bg-ferro-primary rounded-full"
                                style={{ width: `${progress.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-tertiary whitespace-nowrap">
                              {progress.xpIntoLevel}/{progress.xpForNextLevel} XP
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-tertiary">Max level</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {driver.isSuspended ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspended</span>
                        ) : driver.isOnline ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Online</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">Offline</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
