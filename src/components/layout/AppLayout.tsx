'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: true },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, signOut } = useDemoAuth();
  const pathname = usePathname();

  // close mobile drawer when navigating
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-100 flex flex-col',
          // Mobile: off-canvas drawer
          'translate-x-[-100%] md:translate-x-0',
          drawerOpen && 'translate-x-0',
          // Tablet: always collapsed
          'md:w-13 md:w-[52px]',
          // Desktop: full width
          'lg:w-52',
          collapsed && 'lg:w-13 lg:w-[52px]'
        )}
      >
        {/* logo section */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-sidebar-border">
          {!collapsed && !drawerOpen ? (
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">Pensum</p>
            </div>
          ):null}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-5 h-5 items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex md:hidden w-5 h-5 items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* nav menu */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 text-sm transition-colors duration-100 min-h-[44px]',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && !drawerOpen && (
                      <span>{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* user profile section */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && !drawerOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 bg-sidebar-accent flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold">
                    {user?.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-[10px] text-sidebar-foreground/60 capitalize">
                    {user?.role === 'admin' ? 'Supervisor' : 'Researcher'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 bg-sidebar-accent flex items-center justify-center">
                <span className="text-[11px] font-bold">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* main content area */}
      <main
        className={cn(
          'flex-1 transition-all duration-100 overflow-x-hidden',
          // Mobile: full width
          'w-full',
          // Tablet: account for collapsed sidebar
          'md:ml-[52px]',
          // Desktop: account for expanded sidebar
          'lg:ml-52',
          collapsed && 'lg:ml-[52px]'
        )}
      >
        {/* top navigation bar */}
        <header className="fixed top-0 left-0 right-0 h-12 border-b bg-background/95 backdrop-blur z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* mobile menu toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex md:hidden w-8 h-8 items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            >
              <Menu className="w-4 h-4 text-black" />
            </button>
            {/* mobile logo */}
            <div className="flex md:hidden items-center gap-2">
       
              <span className="font-bold text-sm">Pensum</span>
            </div>
            <h1 className="text-sm font-semibold hidden md:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* mobile user info */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-6 h-6 bg-sidebar-accent flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <span className="text-[10px] text-sidebar-foreground/60 capitalize">
                {user?.role === 'admin' ? 'Supervisor' : 'Researcher'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
              <span>Real-time</span>
            </div>
          </div>
        </header>

        {/* page content */}
        <div className="pt-12 p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
