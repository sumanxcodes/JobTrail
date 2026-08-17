'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';

export function BottomNavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isDashboardActive = pathname === '/dashboard';
  const isNewActive = pathname === '/applications/new';

  return (
    <nav className="m3-bottom-nav" aria-label="Mobile Navigation Bar">
      {/* Dashboard Item */}
      <Link
        href="/dashboard"
        className={`m3-nav-item ${isDashboardActive ? 'active' : ''}`}
        style={{ flex: 1 }}
      >
        <div className="m3-active-pill">
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              fontVariationSettings: isDashboardActive ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            work
          </span>
        </div>
        <span className="m3-nav-label">Dashboard</span>
      </Link>

      {/* Quick Add Application Action */}
      <Link
        href="/applications/new"
        className={`m3-nav-item ${isNewActive ? 'active' : ''}`}
        style={{ flex: 1 }}
      >
        <div className="m3-active-pill">
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              fontVariationSettings: isNewActive ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            add_circle
          </span>
        </div>
        <span className="m3-nav-label">Add Job</span>
      </Link>

      {/* Theme Toggle */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ThemeToggle />
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="m3-nav-item"
        style={{ flex: 1, background: 'none', border: 'none' }}
        title="Log out"
        aria-label="Log out"
      >
        <div className="m3-active-pill">
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--md-sys-color-error)' }}>
            logout
          </span>
        </div>
        <span className="m3-nav-label" style={{ color: 'var(--md-sys-color-error)' }}>
          Log out
        </span>
      </button>
    </nav>
  );
}
