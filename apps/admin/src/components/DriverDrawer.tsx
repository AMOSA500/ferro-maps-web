import { useState } from 'react'
import { X } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import { submitAccountAction } from '../lib/accountActions'
import { formatRelativeTime } from '../lib/utils'

export interface DriverDetail {
  uid: string
  name: string
  email: string
  phoneNumber: string
  country: string
  ferroBalance: number
  isOnline: boolean
  isSuspended: boolean
  locationUpdatedAt: Timestamp | null
  joinedAt: Timestamp | null
  suspendedAt: Timestamp | null
}

interface Props {
  driver: DriverDetail | null
  onClose: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function DriverDrawer({ driver, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSuspendToggle() {
    if (!driver) return
    setLoading(true)
    try {
      await submitAccountAction(driver.isSuspended ? 'unsuspend' : 'suspend', driver.uid)
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Failed to update account status:', error)
      alert('Could not update this account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (!driver) return

    const confirmed = window.confirm(
      `Permanently delete ${driver.name}'s account?\n\n` +
        'This removes their Firebase login, profile data, and earnings history. ' +
        'This cannot be undone.',
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await submitAccountAction('delete', driver.uid)
      onClose()
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Could not delete this account. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const isOpen = driver !== null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[360px] bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {driver && (
          <>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center pt-10 pb-6 px-6 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-ferro-primary flex items-center justify-center mb-3">
                <span className="text-white text-xl font-semibold">{getInitials(driver.name)}</span>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">{driver.name}</h2>
              <div className="mt-2">
                {driver.isSuspended ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Suspended
                  </span>
                ) : driver.isOnline ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                    Offline
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Phone</dt>
                  <dd className="mt-1 text-sm text-text-primary">{driver.phoneNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Country</dt>
                  <dd className="mt-1 text-sm text-text-primary">{driver.country || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                    Ferro Balance / Earnings
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {driver.ferroBalance.toLocaleString()} Ferros
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                    Last Location Update
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {formatRelativeTime(driver.locationUpdatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Email</dt>
                  <dd className="mt-1 text-xs text-text-tertiary">{driver.email || '—'}</dd>
                </div>

                {/* Account History */}
                <div>
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mt-2 pt-4 border-t border-gray-100">
                    Account History
                  </p>
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Joined</dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {driver.joinedAt ? driver.joinedAt.toDate().toLocaleDateString() : '—'}
                  </dd>
                </div>
                {driver.isSuspended && driver.suspendedAt && (
                  <div>
                    <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Suspended on</dt>
                    <dd className="mt-1 text-sm text-text-primary">
                      {driver.suspendedAt.toDate().toLocaleDateString()}
                    </dd>
                  </div>
                )}

                {/* Ferros History — placeholder for FM-WEB-051 */}
                <div>
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mt-2 pt-4 border-t border-gray-100">
                    Ferros History
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary italic">Coming soon</p>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col gap-2">
              {driver.isSuspended ? (
                <button
                  onClick={handleSuspendToggle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-button bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {loading && <Spinner />}
                  Enable account
                </button>
              ) : (
                <button
                  onClick={handleSuspendToggle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-button bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {loading && <Spinner />}
                  Disable account
                </button>
              )}
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-button border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                {deleting && <Spinner />}
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
