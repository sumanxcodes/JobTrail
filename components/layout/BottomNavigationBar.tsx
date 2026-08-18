'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from './ThemeToggle';
import { NewApplicationSheet } from '@/components/applications/NewApplicationSheet';

export function BottomNavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isInsightsActive = pathname === '/dashboard';
  const isApplicationsActive =
    pathname === '/applications' ||
    (pathname.startsWith('/applications/') && pathname !== '/applications/new');

  return (
    <>
      <nav className="m3-bottom-nav" aria-label="Mobile Navigation Bar">
        {/* Dashboard Item (Uses App Logo) */}
        <Link
          href="/dashboard"
          className={`m3-nav-item ${isInsightsActive ? 'active' : ''}`}
          style={{ flex: 1 }}
        >
          <div className="m3-active-pill">
            <Logo size={22} color="currentColor" />
          </div>
          <span className="m3-nav-label">Dashboard</span>
        </Link>

        {/* Applications Table Item */}
        <Link
          href="/applications"
          className={`m3-nav-item ${isApplicationsActive ? 'active' : ''}`}
          style={{ flex: 1 }}
        >
          <div className="m3-active-pill">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '24px',
                fontVariationSettings: isApplicationsActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              business_center
            </span>
          </div>
          <span className="m3-nav-label">Applications</span>
        </Link>

        {/* Quick Add Action */}
        <button
          onClick={() => setIsNewSheetOpen(true)}
          className="m3-nav-item"
          style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          title="Add New Application"
          aria-label="Add New Application"
        >
          <div className="m3-active-pill">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '24px',
                color: 'var(--md-sys-color-primary)',
              }}
            >
              add_circle
            </span>
          </div>
          <span className="m3-nav-label" style={{ color: 'var(--md-sys-color-primary)', fontWeight: 700 }}>
            Add Job
          </span>
        </button>

        {/* Theme Toggle */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ThemeToggle />
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="m3-nav-item"
          style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          title="Log out"
          aria-label="Log out"
        >
          <div className="m3-active-pill">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '24px', color: 'var(--md-sys-color-error)' }}
            >
              logout
            </span>
          </div>
          <span className="m3-nav-label" style={{ color: 'var(--md-sys-color-error)' }}>
            Log out
          </span>
        </button>
      </nav>

      {/* Mobile Quick Add Side Sheet */}
      <NewApplicationSheet
        open={isNewSheetOpen}
        onClose={() => setIsNewSheetOpen(false)}
        onCreated={(newApp) => {
          setIsNewSheetOpen(false);
          router.push(`/applications/${newApp.id}`);
          router.refresh();
        }}
      />
    </>
  );
}
