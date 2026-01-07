'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Clock,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface StaffPermissions {
  can_view_appointments: boolean
  can_edit_own_schedule: boolean
  can_add_time_blocks: boolean
  can_add_special_dates: boolean
}

interface StaffSidebarProps {
  staffName: string
  staffColor: string
  permissions: StaffPermissions
}

export function StaffSidebar({ staffName, staffColor, permissions }: StaffSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/staff',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Mis Citas',
      href: '/staff/citas',
      icon: Calendar,
      show: permissions.can_view_appointments,
    },
    {
      label: 'Calendario',
      href: '/staff/calendario',
      icon: CalendarDays,
      show: permissions.can_view_appointments,
    },
    {
      label: 'Mis Horarios',
      href: '/staff/horarios',
      icon: Clock,
      show: permissions.can_edit_own_schedule || permissions.can_add_time_blocks || permissions.can_add_special_dates,
    },
  ].filter(item => item.show)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/staff" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: staffColor }}
          >
            {staffName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-secondary text-sm">{staffName}</div>
            <div className="text-xs text-muted">Portal Colaborador</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/staff' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-secondary hover:bg-surface'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-secondary hover:bg-surface transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesion</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-40 flex items-center justify-between px-4">
        <Link href="/staff" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: staffColor }}
          >
            {staffName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-secondary">Portal Staff</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-surface"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-16">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 bottom-0 w-64 bg-white flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-border flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
