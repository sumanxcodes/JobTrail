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
  const isApplicationsActive =
    pathname === '/applications' ||
    (pathname.startsWith('/applications/') && pathname !== '/applications/new');

  return (
    <aside className="m3-nav-rail" aria-label="Main Navigation">
      {/* Top Group: Logo Badge, FAB, and Navigation Destinations */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Brand Stepped-Arch Circular Badge */}
        <Link
          href="/dashboard"
          title="JobTrail Workspace"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
            border: '1.5px solid var(--md-sys-color-outline-variant)',
            textDecoration: 'none',
            marginBottom: '2rem', /* 32px deliberate visual separation to navigation destinations */
            transition: 'all 0.2s ease',
          }}
        >
          <Logo size={22} color="var(--md-sys-color-primary)" />
        </Link>

        {/* Middle Navigation Destinations (20px Rhythm) */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem', /* 20px between destination item blocks */
            width: '100%',
          }}
        >
          {/* Dashboard Destination */}
          <Link
            href="/dashboard"
            className={`m3-nav-item ${isDashboardActive ? 'active' : ''}`}
            title="Dashboard Overview"
          >
            <div className="m3-active-pill">
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  fontVariationSettings: isDashboardActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                space_dashboard
              </span>
            </div>
            <span className="m3-nav-label">Dashboard</span>
          </Link>

          {/* Applications Table Destination */}
          <Link
            href="/applications"
            className={`m3-nav-item ${isApplicationsActive ? 'active' : ''}`}
            title="Applications Data Table"
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
        </nav>
      </div>

      {/* Bottom Group: Circular Outlined Action Controls (48×48px with 16px gap) */}
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
        {/* User Account / Profile Circular Outlined Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="m3-rail-circle-btn"
            title={userEmail ? `Logged in as ${userEmail}` : 'User Profile'}
            aria-label="User Account Menu"
          >
            {userEmail ? (
              <span
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                }}
              >
                {userEmail.charAt(0)}
              </span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                person
              </span>
            )}
          </button>

          {/* Account Popover Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '56px',
                left: '52px',
                width: '230px',
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
              <div
                style={{
                  padding: '0.25rem 0.5rem',
                  borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                  paddingBottom: '0.5rem',
                }}
              >
                <p style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-outline)', fontFamily: 'var(--font-headline)' }}>
                  Account
                </p>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface)',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
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

        {/* Circular Outlined Theme Switcher Button (48×48px) */}
        <ThemeToggle />
      </div>
    </aside>
  );
}
