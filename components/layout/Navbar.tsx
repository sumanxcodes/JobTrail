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
        backgroundColor: 'var(--md-sys-color-surface)',
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
            gap: '0.5rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: 'var(--md-sys-color-primary)',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Logo size={24} color="var(--md-sys-color-primary)" />
          <span>JobTrail</span>
        </Link>

        {/* Actions & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          {/* M3 Standard/Outlined Icon Button (40x40px, 0dp resting elevation) */}
          <ThemeToggle />

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  className="nav-action-text"
                  style={{
                    backgroundColor:
                      pathname === '/dashboard'
                        ? 'var(--md-sys-color-surface-container-high)'
                        : 'transparent',
                    color:
                      pathname === '/dashboard'
                        ? 'var(--md-sys-color-primary)'
                        : 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  href="/applications/new"
                  className="nav-action-filled"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    add
                  </span>
                  <span>Add</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="nav-action-text"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* M3 Text Button */}
                <Link
                  href="/login"
                  className="nav-action-text"
                >
                  Log in
                </Link>

                {/* M3 Filled Button */}
                <Link
                  href="/signup"
                  className="nav-action-filled"
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
