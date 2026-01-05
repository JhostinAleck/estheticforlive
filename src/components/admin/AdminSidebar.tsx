'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Scissors,
  Users,
  UserCircle,
  Images,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { signOut } from '@/lib/actions/auth'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Calendario',
    href: '/admin/calendario',
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    label: 'Reservas',
    href: '/admin/reservas',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: 'Servicios',
    href: '/admin/servicios',
    icon: <Scissors className="w-5 h-5" />,
  },
  {
    label: 'Resultados',
    href: '/admin/resultados',
    icon: <Images className="w-5 h-5" />,
  },
  {
    label: 'Personal',
    href: '/admin/personal',
    icon: <UserCircle className="w-5 h-5" />,
  },
  {
    label: 'Clientes',
    href: '/admin/clientes',
    icon: <Users className="w-5 h-5" />,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/esthetic-logo.png"
                alt="Esthetic For Live"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-xs text-muted mt-2">Panel de Administración</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-accent text-white'
                    : 'text-secondary hover:bg-surface'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:bg-surface transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Ver sitio
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
