'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from './ThemeToggle';

export function NavigationRail() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
    }
    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isDashboardActive = pathname === '/dashboard';
  const isNewActive = pathname === '/applications/new';

  return (
    <aside className="m3-nav-rail" aria-label="Main Navigation">
      {/* Top Group: Brand Logo & FAB */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
        {/* Brand Step Arch Logo */}
        <Link
          href="/dashboard"
          title="JobTrail Dashboard"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            transition: 'all 0.2s ease',
          }}
        >
          <Logo size={24} color="var(--md-sys-color-primary)" />
        </Link>

        {/* M3 Floating Action Button (FAB) -> + Add Application */}
        <Link
          href="/applications/new"
          className="m3-fab-btn"
          title="Add New Application"
          aria-label="Add New Application"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            add
          </span>
        </Link>

        {/* Middle Navigation Destinations */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
          {/* Dashboard Item */}
          <Link
            href="/dashboard"
            className={`m3-nav-item ${isDashboardActive ? 'active' : ''}`}
            title="Applications Dashboard"
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
        </nav>
      </div>

      {/* Bottom Group: Theme Toggle & User Menu */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar & Logout Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={userEmail ? `Logged in as ${userEmail}` : 'User Profile'}
            aria-label="User Account Menu"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--md-sys-color-outline-variant)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {userEmail ? userEmail.charAt(0) : <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>}
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '48px',
                left: '48px',
                width: '220px',
                backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: '16px',
                padding: '0.75rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-outline)', fontFamily: 'var(--font-headline)' }}>Account</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail || 'User'}
                </p>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--md-sys-color-error)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--md-sys-color-error-container)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  logout
                </span>
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
