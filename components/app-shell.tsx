'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Network, CalendarDays, Images, Settings, Search, Menu, X,
  Moon, Sun, UserRound, HandCoins, Landmark, Boxes, Hammer, Bell, Shield,
  Users, Home, BarChart3, ScrollText,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CURRENT_USER } from '@/lib/mock-data';
import { LogoutButton } from '@/components/logout-button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Menu sidebar - đủ 15 module theo PROJECT.md */
const NAV = [
  { href: '/', label: 'Trang chủ', icon: LayoutDashboard },
  { href: '/nha-tho-ho', label: 'Nhà thờ họ', icon: Landmark },
  { href: '/tree', label: 'Sơ đồ gia phả', icon: Network },
  { href: '/members', label: 'Thành viên', icon: Users },
  { href: '/families', label: 'Gia đình', icon: Home },
  { href: '/graves', label: 'Mộ phần', icon: Boxes },
  { href: '/events', label: 'Sự kiện', icon: CalendarDays },
  { href: '/restoration', label: 'Tu bổ – Sửa chữa', icon: Hammer },
  { href: '/contributions', label: 'Quỹ công đức', icon: HandCoins },
  { href: '/relations', label: 'Tìm kiếm AI', icon: Search },
  { href: '/tro-ly', label: 'Trợ lý gia tộc', icon: ScrollText },
  { href: '/notifications', label: 'Thông báo', icon: Bell },
  { href: '/library', label: 'Thư viện', icon: Images },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
  { href: '/roles', label: 'Phân quyền', icon: Shield },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-gold bg-gold/15 text-lg">
        🌳
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-bold text-gold">Gia Phả</div>
          <div className="text-sm font-semibold text-white/90">Dòng Họ Nguyễn</div>
        </div>
      )}
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 py-4">
      {NAV.map((item) => {
        const base = item.href.split('?')[0];
        const active =
          item.href === '/' ? pathname === '/' :
          item.label === 'Tài liệu' ? false : pathname.startsWith(base);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white',
              active && 'bg-white/15 text-gold shadow-inner'
            )}
          >
            <Icon className="h-4.5 w-4.5 size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export interface ShellUser {
  name: string;
  role: string;
  initials: string;
}

/** Khung ứng dụng: sidebar đỏ đậm #8B0000 (desktop) + drawer (mobile) + header */
export function AppShell({ children, user }: { children: React.ReactNode; user?: ShellUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const currentUser = user ?? CURRENT_USER;

  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-primary px-3 py-4 lg:flex">
        <Logo />
        <SidebarNav />
        <div className="border-t border-white/15 pt-3 text-xs text-white/60 px-3">
          © 2026 Gia Phả Dòng Tộc
        </div>
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-primary px-3 py-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between">
              <Logo />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu />
          </Button>
          <div className="relative hidden w-full max-w-sm sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm kiếm thành viên..." className="rounded-full pl-9 bg-background" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Đổi giao diện sáng/tối"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="hidden dark:block" />
              <Moon className="dark:hidden" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-accent focus:outline-none">
                <Avatar className="h-9 w-9 border-2 border-gold/60">
                  <AvatarFallback>{currentUser.initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-left md:block">
                  <span className="block text-sm font-semibold leading-tight">{currentUser.name}</span>
                  <span className="block text-xs text-muted-foreground leading-tight">{currentUser.role}</span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/members/1"><UserRound /> Hồ sơ của tôi</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings"><Settings /> Cài đặt</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
