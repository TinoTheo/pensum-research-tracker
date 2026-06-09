'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  FlaskConical,
  Shield,
  UserCircle,
  Moon,
  Sun,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users,           label: 'Team',       href: '/team',     roles: ['ADMIN', 'SUPERVISOR'] },
  { icon: Settings,        label: 'Settings',   href: '/settings' },
];

const PAGE_TITLES: Record<string, string> = {
  '/':               'Dashboard',
  '/team':           'Team',
  '/settings':       'Settings',
  '/admin/settings': 'Admin Settings',
  '/invite/accept':  'Accept Invitation',
  '/reset-password': 'Reset Password',
};

function getRoleLabel(role?: string) {
  if (role === 'ADMIN')      return 'Administrator';
  if (role === 'SUPERVISOR') return 'Supervisor';
  return 'Researcher';
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-150 min-h-[40px] group',
        isActive
          ? 'bg-sidebar-accent text-sidebar-primary font-medium'
          : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
      )}
    >
      {isActive && (
        <span className="nav-active-bar" />
      )}
      <item.icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme]           = useState<'light' | 'dark'>('light');
  const { user, loading, signOut }  = useAuth();
  const pathname                    = usePathname();
  const router                      = useRouter();

  /* Redirect to login whenever the user is signed out */
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

  /* Close mobile drawer on navigation */
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  /* Read persisted theme */
  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    const isDark = saved === 'dark' || document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
  };

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const initials  = getInitials(user?.name);
  const roleLabel = getRoleLabel(user?.role);
  const showLabels = !collapsed;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-background flex">

        {/* ── Mobile backdrop ──────────────────────────────────── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden animate-in fade-in duration-150"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-screen bg-sidebar text-sidebar-foreground',
            'border-r border-sidebar-border flex flex-col',
            'sidebar-anim',
            /* Mobile: off-canvas */
            '-translate-x-full md:translate-x-0',
            drawerOpen && 'translate-x-0',
            /* Desktop widths */
            'md:w-[60px] lg:w-60',
            collapsed && 'lg:w-[60px]',
          )}
        >
          {/* Brand / Logo */}
          <div
            className={cn(
              'flex items-center border-b border-sidebar-border h-14 shrink-0 px-3 gap-3',
              collapsed && 'justify-center px-0'
            )}
          >
            {showLabels && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">Pensum</p>
                  <p className="text-[10px] text-sidebar-foreground/45 leading-tight mt-px">
                    Research Tracker
                  </p>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors shrink-0"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Expand button when collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mobile close */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex md:hidden w-7 h-7 items-center justify-center ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {visibleNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                collapsed={collapsed}
              />
            ))}

            {/* Separator before admin settings if admin */}
            {user?.role === 'ADMIN' && (
              <>
                <div className="my-2 border-t border-sidebar-border/50" />
                <NavLink
                  item={{ icon: Shield, label: 'Admin Settings', href: '/admin/settings' }}
                  isActive={pathname === '/admin/settings'}
                  collapsed={collapsed}
                />
              </>
            )}
          </nav>

          {/* User profile footer */}
          <div className="border-t border-sidebar-border p-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-sidebar-accent/60 transition-colors text-left',
                    collapsed && 'justify-center'
                  )}
                >
                  <div className="w-7 h-7 rounded-md bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-sidebar-primary">{initials}</span>
                  </div>
                  {showLabels && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">{user?.name}</p>
                        <p className="text-[10px] text-sidebar-foreground/50 truncate leading-tight mt-px">
                          {roleLabel}
                        </p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-sidebar-foreground/35 shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
                <DropdownMenuLabel className="font-normal py-2">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{roleLabel}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-sm">
                    <UserCircle className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme} className="text-sm cursor-pointer">
                  {theme === 'light'
                    ? <Moon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    : <Sun  className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  }
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-sm text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main
          className={cn(
            'flex-1 overflow-x-hidden main-content-anim',
            'md:ml-[60px] lg:ml-60',
            collapsed && 'lg:ml-[60px]'
          )}
        >
          {/* Top header */}
          <header
            className={cn(
              'fixed top-0 right-0 h-14 z-30 flex items-center gap-3 px-4',
              'bg-background/95 backdrop-blur-sm border-b',
              'left-0 md:left-[60px] lg:left-60',
              collapsed && 'lg:left-[60px]',
              'header-anim'
            )}
          >
            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex md:hidden w-8 h-8 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb / page title */}
            <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                <span>Pensum</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </span>
              <h1 className="text-sm font-semibold truncate">{pageTitle}</h1>
            </nav>

            {/* Right-side controls */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live</span>
              </div>

              {/* Role badge */}
              <div className="hidden md:flex items-center gap-1.5 text-[11px] bg-muted/60 px-2.5 py-1 rounded-full text-muted-foreground">
                {user?.role === 'ADMIN' && <Shield className="w-3 h-3 text-primary" />}
                <span>{roleLabel}</span>
              </div>

              {/* Notification bell */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Notifications</TooltipContent>
              </Tooltip>

              {/* Avatar */}
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-primary">{initials}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="pt-14 min-h-screen">
            <div className="px-4 md:px-6 py-6 max-w-screen-2xl animate-page-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
