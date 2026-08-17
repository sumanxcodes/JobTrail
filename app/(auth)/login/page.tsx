'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextField } from '@/components/ui/TextField';
import { FilledButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccessMsg('Magic sign-in link sent! Check your email inbox.');
      } else {
        if (!password) {
          setErrorMsg('Please enter your password.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hero-curve-bg" />

      <div className="container" style={{ maxWidth: '460px', padding: '2rem 1.25rem', position: 'relative', zIndex: 1 }}>
        <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                lock
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '0.25rem',
              }}
            >
              {isMagicLink ? 'Sign in with Magic Link' : 'Welcome back'}
            </h1>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
              {isMagicLink
                ? 'Enter your email to receive a passwordless sign-in link.'
                : 'Enter your credentials to access your job applications.'}
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--md-sys-color-error-container)',
                color: 'var(--md-sys-color-on-error-container)',
                fontSize: '0.875rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--status-offer-bg)',
                color: 'var(--status-offer-text)',
                fontSize: '0.875rem',
              }}
            >
              {successMsg}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <TextField
              label="Email address"
              type="email"
              value={email}
              onValueChange={setEmail}
              required
              leadingIcon="mail"
            />

            {!isMagicLink && (
              <TextField
                label="Password"
                type="password"
                value={password}
                onValueChange={setPassword}
                required
                leadingIcon="lock"
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/reset-password">
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--md-sys-color-primary)',
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </span>
              </Link>
            </div>

            <FilledButton onClick={() => handleLogin()} disabled={loading}>
              {loading ? <CircularProgress /> : isMagicLink ? 'Send Magic Link' : 'Sign In'}
            </FilledButton>
          </form>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              paddingTop: '1rem',
            }}
          >
            <TextButton onClick={() => setIsMagicLink(!isMagicLink)}>
              {isMagicLink ? 'Use Email & Password instead' : 'Use Passwordless Magic Link'}
            </TextButton>

            <p style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                style={{
                  color: 'var(--md-sys-color-primary)',
                  fontWeight: 600,
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
