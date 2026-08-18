'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextField } from '@/components/ui/TextField';
import { Logo } from '@/components/ui/Logo';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) throw error;

      if (data?.session) {
        window.location.href = '/dashboard';
      } else {
        setSuccessMsg('Account created! Please check your email for the confirmation link.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign up.');
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
          }}
        >
          {/* Card Header & Brand Icon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
                Create Account
              </h1>
              <p
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                }}
              >
                Start tracking all your job applications in one unified workspace.
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
            onSubmit={handleSignup}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <TextField
              label="Email address"
              type="email"
              value={email}
              onValueChange={setEmail}
              leadingIcon="mail"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              leadingIcon="lock"
              supportingText="Must be at least 6 characters"
            />

            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              leadingIcon="lock_reset"
            />

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
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              paddingTop: '1.25rem',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Already have an account?{' '}
              <Link
                href="/login"
                style={{
                  color: 'var(--md-sys-color-primary)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
