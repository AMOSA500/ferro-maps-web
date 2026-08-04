import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LayoutDashboard, Car, MessageSquare, Settings, ChevronLeft, ChevronRight, Bell, Star } from 'lucide-react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { isTicketUnread, type UnreadTicket } from '../lib/utils'
import ferroBirdIcon from '../assets/ferro-bird-icon.png'

type AppShellProps = {
  children: ReactNode
  title: string
  unreadCount?: number
}

function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const local = email.split('@')[0].toUpperCase()
  const parts = local.split(/[.\-_]/).filter(Boolean)
  return parts.map((p) => p[0]).join('').slice(0, 2) || local.slice(0, 2)
}

export default function AppShell({ children, title }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const q = query(collection(db, 'supportRequests'))
    const unsub = onSnapshot(q, (snap) => {
      const count = snap.docs.filter((d) => isTicketUnread(d.data() as UnreadTicket)).length
      setUnreadCount(count)
    })
    return () => unsub()
  }, [])
  const { user } = useAuth()
  const initials = getInitials(user?.email)

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Drivers', to: '/drivers', icon: <Car size={20} /> },
    { label: 'Driver XP', to: '/rankings', icon: <Star size={20} /> },
    {
      label: 'Messages',
      to: '/messages',
      icon: <MessageSquare size={20} />,
      badge: unreadCount,
    },
    { label: 'Settings', to: '/settings', icon: <Settings size={20} /> },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-ferro-deep transition-[width] duration-base ease-standard flex-shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-[220px]'
        }`}
      >
        {/* Logo + toggle */}
        <div
          className={`flex items-center py-5 ${
            collapsed ? 'px-2 justify-between' : 'px-4 gap-3'
          }`}
        >
          <img
            src={ferroBirdIcon}
            alt="Ferro Maps"
            className="w-8 h-8 rounded-md flex-shrink-0"
          />
          {!collapsed && (
            <span className="text-white font-medium text-label truncate flex-1">Ferro Maps</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-5 h-5 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-fast flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const base = 'flex items-center rounded-md transition-colors duration-fast text-label'
                const layout = collapsed ? 'justify-center py-2 px-2' : 'gap-3 px-3 py-2'
                const color = isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
                return `${base} ${layout} ${color}`
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="ml-auto rounded-full bg-ferro-signal text-ferro-ink text-overline font-semibold px-1.5 py-0.5 leading-none">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/15">
          <div
            className={`flex items-center py-4 ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-4'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-caption font-semibold">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-caption truncate">{user?.email}</p>
                <p className="text-white/60 text-overline">Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 bg-white">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-border-default flex-shrink-0">
          <h1 className="text-subtitle font-semibold text-text-primary">{title}</h1>
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-raised transition-colors duration-fast"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-ferro-tint flex items-center justify-center flex-shrink-0">
              <span className="text-ferro-deep text-caption font-semibold">{initials}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
