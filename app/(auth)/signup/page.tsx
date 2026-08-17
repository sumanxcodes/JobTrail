'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextField } from '@/components/ui/TextField';
import { FilledButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

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
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
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
                person_add
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
              Create Account
            </h1>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
              Track all your job applications in one organized place.
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
              handleSignup();
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

            <TextField
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              required
              leadingIcon="lock"
            />

            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              required
              leadingIcon="lock_reset"
            />

            <FilledButton onClick={() => handleSignup()} disabled={loading}>
              {loading ? <CircularProgress /> : 'Create Free Account'}
            </FilledButton>
          </form>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              paddingTop: '1rem',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                style={{
                  color: 'var(--md-sys-color-primary)',
                  fontWeight: 600,
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
