import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { Search, ListChecks } from 'lucide-react'
import { db } from '../lib/firebase'
import AppShell from '../components/AppShell'
import { toSafeDate } from '../lib/utils'

type WaitlistEntry = {
  id: string
  email: string
  country: string
  signedUpAt: Timestamp | null
}

export default function Waitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'waitlist'), orderBy('signedUpAt', 'desc'))

    const unsub = onSnapshot(q, (snap) => {
      const docs: WaitlistEntry[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          email: data.email ?? '',
          country: data.country ?? '',
          signedUpAt: data.signedUpAt ?? null,
        }
      })
      setEntries(docs)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const filtered = entries.filter((e) => {
    const q = search.trim().toLowerCase()
    return !q || e.email.toLowerCase().includes(q)
  })

  return (
    <AppShell title="Waitlist">
      <div className="flex flex-col gap-6">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks size={20} className="text-ferro-signal" />
            <p className="text-sm text-text-secondary">
              People who signed up to be notified when Ferro Maps launches
            </p>
          </div>
          {!loading && (
            <p className="text-sm font-medium text-text-primary whitespace-nowrap">
              {entries.length.toLocaleString()} {entries.length === 1 ? 'person' : 'people'} on the waitlist
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-button border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ferro-primary"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-gray-200 shadow-md overflow-hidden">
          <p className="md:hidden text-xs text-gray-400 px-4 pt-3">Swipe to see more</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0">
                    <td className="px-4 py-3"><div className="h-3 w-40 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-neutral-200 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-32 bg-neutral-200 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="py-16 text-center text-text-secondary">
                      {search ? 'No signups match your search' : 'No signups yet'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-text-primary">{entry.email}</td>
                    <td className="px-4 py-3 text-text-secondary">{entry.country}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {toSafeDate(entry.signedUpAt)?.toLocaleDateString() ?? 'Unknown'}
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
