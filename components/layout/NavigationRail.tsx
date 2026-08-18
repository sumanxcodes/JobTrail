'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from './ThemeToggle';
import { NewApplicationSheet } from '@/components/applications/NewApplicationSheet';

export function NavigationRail() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
    }
    loadUser();
  }, [supabase]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.m3-user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [showUserMenu]);

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
    <>
      <aside className="m3-nav-rail" aria-label="Main Navigation">
        {/* Top Group: Quick Add FAB & Navigation Destinations */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1.25rem' }}>
          {/* Canonical M3 Standard FAB (56x56dp, 16dp corner radius) */}
          <button
            onClick={() => setIsNewSheetOpen(true)}
            className="m3-fab-btn"
            title="Add New Application"
            aria-label="Add New Application"
            style={{
              marginBottom: '0.75rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              add
            </span>
          </button>

          {/* Middle Navigation Destinations */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
            }}
          >
            {/* Dashboard Destination (Uses App Logo Icon) */}
            <Link
              href="/dashboard"
              className={`m3-nav-item ${isDashboardActive ? 'active' : ''}`}
              title="Dashboard Overview"
            >
              <div className="m3-active-pill">
                <Logo size={22} color="currentColor" />
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

        {/* Bottom Group: Circular Action Controls & Account Profile */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.875rem',
            width: '100%',
            position: 'relative',
          }}
        >
          {/* User Account / Profile Button */}
          <div className="m3-user-menu-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User Account Menu"
              title={userEmail ? `Signed in as ${userEmail}` : 'User Profile'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                border: '1.5px solid var(--md-sys-color-outline-variant)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {userEmail ? (
                userEmail.charAt(0)
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  person
                </span>
              )}
            </button>

            {/* Official M3 Menu Surface (Specs: 16dp radius, Surface Container, 48dp items, Level 2 elevation) */}
            {showUserMenu && (
              <div
                role="menu"
                aria-label="Account options"
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  left: '52px',
                  width: '260px',
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: '16px',
                  padding: '0.5rem 0',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'scaleUp 0.15s cubic-bezier(0.2, 0, 0, 1)',
                }}
              >
                {/* Header: User Account Summary */}
                <div
                  style={{
                    padding: '0.625rem 1rem 0.5rem 1rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Signed in as
                  </p>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--md-sys-color-on-surface)',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      margin: 0,
                    }}
                  >
                    {userEmail || 'User'}
                  </p>
                </div>

                {/* M3 Divider (1dp height, outline-variant) */}
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--md-sys-color-outline-variant)',
                    margin: '0.25rem 0',
                  }}
                />

                {/* M3 Menu Item (48dp height, 12-16dp padding, Label Large) */}
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    height: '44px',
                    padding: '0 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--md-sys-color-error)',
                    fontFamily: 'var(--font-headline)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--md-sys-color-error-container)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    logout
                  </span>
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher Button */}
          <ThemeToggle />
        </div>
      </aside>

      {/* Global Quick Add Job Side Sheet */}
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
