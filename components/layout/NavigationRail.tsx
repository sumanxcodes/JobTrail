'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from './ThemeToggle';
import { NewApplicationSheet } from '@/components/applications/NewApplicationSheet';
import { Ripple } from '@/components/ui/Ripple';

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

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

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
            <Ripple centered={true} />
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
              prefetch={true}
              className={`m3-nav-item ${isDashboardActive ? 'active' : ''}`}
              title="Dashboard Overview"
            >
              <div className="m3-active-pill">
                <Logo size={22} color="currentColor" />
                <Ripple centered={true} />
              </div>
              <span className="m3-nav-label">Dashboard</span>
            </Link>

            {/* Applications Table Destination */}
            <Link
              href="/applications"
              prefetch={true}
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
                <Ripple centered={true} />
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
              aria-haspopup="true"
              aria-expanded={showUserMenu}
              title={userEmail ? `Signed in as ${userEmail}` : 'User Profile'}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                border: showUserMenu
                  ? '2px solid var(--md-sys-color-primary)'
                  : '1.5px solid var(--md-sys-color-outline-variant)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!showUserMenu) {
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showUserMenu) {
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {userEmail ? (
                userInitial
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  person
                </span>
              )}
              <Ripple centered={true} />
            </button>

            {/* Official Material Design 3 Menu Popover */}
            {showUserMenu && (
              <div
                role="menu"
                aria-label="Account options"
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  left: '64px',
                  width: '264px',
                  backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: '16px',
                  padding: '0.5rem 0',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'scaleUp 0.15s cubic-bezier(0.2, 0, 0, 1)',
                  overflow: 'hidden',
                }}
              >
                {/* Header: User Account Identity Block */}
                <div
                  style={{
                    padding: '0.75rem 1rem 0.625rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--md-sys-color-primary-container)',
                      color: 'var(--md-sys-color-on-primary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    {userInitial}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontFamily: 'var(--font-headline)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1.2,
                      }}
                    >
                      JobTrail Account
                    </span>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--md-sys-color-on-surface)',
                        fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '0.15rem',
                      }}
                      title={userEmail || ''}
                    >
                      {userEmail || 'User'}
                    </span>
                  </div>
                </div>

                {/* M3 Divider */}
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--md-sys-color-outline-variant)',
                    margin: '0.25rem 0 0.35rem 0',
                  }}
                />

                {/* Menu Items Container with Inset Insets */}
                <div style={{ padding: '0 0.375rem' }}>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      height: '40px',
                      padding: '0 0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--md-sys-color-error)',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--md-sys-color-error-container)';
                      e.currentTarget.style.color =
                        'var(--md-sys-color-on-error-container)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--md-sys-color-error)';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      logout
                    </span>
                    <span>Log out</span>
                    <Ripple color="var(--md-sys-color-error)" centered={false} />
                  </button>
                </div>
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
