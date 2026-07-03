'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useDemoUser } from '@/context/demo-user-context';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, workspaceName } = useDemoUser();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          ClientPulse
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              aria-current={pathname === item.href ? 'page' : undefined}
              className="nav-link"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="topbar-meta">
          <span className="muted hide-sm">{workspaceName}</span>
          <span className="pill hide-md">{currentUser}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
