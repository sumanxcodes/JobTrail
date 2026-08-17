'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from '@/components/ui/Logo';

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Brand */}
        <Link
          href={userEmail ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--md-sys-color-primary)',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
          }}
        >
          <Logo size={26} color="var(--md-sys-color-primary)" />
          <span>JobTrail</span>
        </Link>

        {/* Actions & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* M3 Standard/Outlined Icon Button (40x40px, 0dp resting elevation) */}
          <ThemeToggle />

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    padding: '0 1rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    color:
                      pathname === '/dashboard'
                        ? 'var(--md-sys-color-primary)'
                        : 'var(--md-sys-color-on-surface-variant)',
                    borderRadius: '9999px',
                    backgroundColor:
                      pathname === '/dashboard'
                        ? 'var(--md-sys-color-surface-container-high)'
                        : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== '/dashboard') {
                      e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                      e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== '/dashboard') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                    }
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  href="/applications/new"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    height: '40px',
                    padding: '0 1.5rem',
                    borderRadius: '9999px',
                    boxShadow: 'none',
                    border: 'none',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    add
                  </span>
                  <span>Add Application</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    padding: '0 0.875rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    borderRadius: '9999px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                    e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* M3 Text Button: Height 40px, Label Large (14px/600), 0dp elevation */}
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    padding: '0 1rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    borderRadius: '9999px',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                    e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                  }}
                >
                  Log in
                </Link>

                {/* M3 Filled Button: Height 40px, Padding 24px, Label Large, 0dp resting elevation */}
                <Link
                  href="/signup"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    padding: '0 1.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    borderRadius: '9999px',
                    border: 'none',
                    boxShadow: 'none',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
