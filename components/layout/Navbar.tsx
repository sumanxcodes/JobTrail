'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
        <Link
          href={userEmail ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'var(--md-sys-color-primary)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            work
          </span>
          <span>JobTrail</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!loading && (
            <>
              {userEmail ? (
                <>
                  <Link href="/dashboard">
                    <TextButton icon="dashboard">Dashboard</TextButton>
                  </Link>
                  <Link href="/applications/new">
                    <FilledButton icon="add">New Application</FilledButton>
                  </Link>
                  <TextButton icon="logout" onClick={handleLogout}>
                    Log out
                  </TextButton>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <TextButton>Log in</TextButton>
                  </Link>
                  <Link href="/signup">
                    <FilledButton>Sign up</FilledButton>
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
