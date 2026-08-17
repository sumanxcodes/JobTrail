'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
      setLoading(false);
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
        backdropFilter: 'blur(10px)',
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
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--md-sys-color-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '24px', color: 'var(--md-sys-color-primary)' }}
          >
            work
          </span>
          <span>JobTrail</span>
        </Link>

        {/* Navigation Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!loading && (
            <>
              {userEmail ? (
                <>
                  <Link
                    href="/dashboard"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color:
                        pathname === '/dashboard'
                          ? 'var(--md-sys-color-primary)'
                          : 'var(--md-sys-color-on-surface-variant)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/applications/new"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--md-sys-color-primary)',
                      color: 'var(--md-sys-color-on-primary)',
                      padding: '0.5rem 1.125rem',
                      borderRadius: '9999px',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      add
                    </span>
                    <span>Add Application</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      padding: '0.4rem 0.75rem',
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--md-sys-color-primary)',
                      color: 'var(--md-sys-color-on-primary)',
                      padding: '0.55rem 1.35rem',
                      borderRadius: '9999px',
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(36,56,156,0.25)',
                    }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
