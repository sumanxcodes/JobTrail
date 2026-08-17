'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextField } from '@/components/ui/TextField';
import { Logo } from '@/components/ui/Logo';

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
        setSuccessMsg('Magic sign-in link sent! Please check your email inbox.');
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
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: '440px',
          padding: 0,
        }}
      >
        <div
          className="m3-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2.25rem 2rem',
            borderRadius: '28px',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Card Header & Brand Icon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Logo size={26} color="var(--md-sys-color-on-primary-container)" />
              </div>

              <Link
                href="/"
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  transition: 'color 0.15s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  arrow_back
                </span>
                <span>Home</span>
              </Link>
            </div>

            <div>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 800,
                  color: 'var(--md-sys-color-on-surface)',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.35rem',
                }}
              >
                {isMagicLink ? 'Sign in with Magic Link' : 'Welcome back'}
              </h1>
              <p
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                }}
              >
                {isMagicLink
                  ? 'Enter your email to receive a secure passwordless sign-in link.'
                  : 'Enter your credentials to access your job applications.'}
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.875rem 1rem',
                borderRadius: '14px',
                backgroundColor: 'var(--md-sys-color-error-container)',
                color: 'var(--md-sys-color-on-error-container)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.875rem 1rem',
                borderRadius: '14px',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  required
                  leadingIcon="lock"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    href="/reset-password"
                    style={{
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-headline)',
                      color: 'var(--md-sys-color-primary)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            )}

            {/* M3 Primary Full-Width Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      animation: 'spin 1s linear infinite',
                    }}
                  >
                    progress_activity
                  </span>
                  <span>Signing in...</span>
                </span>
              ) : isMagicLink ? (
                'Send Magic Link'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              paddingTop: '1.25rem',
            }}
          >
            {/* Toggle Magic Link Button */}
            <button
              type="button"
              onClick={() => {
                setIsMagicLink(!isMagicLink);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--md-sys-color-primary)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
              }}
            >
              {isMagicLink ? 'Use Email & Password instead' : 'Use Passwordless Magic Link'}
            </button>

            <p
              style={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                style={{
                  color: 'var(--md-sys-color-primary)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  textDecoration: 'none',
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
