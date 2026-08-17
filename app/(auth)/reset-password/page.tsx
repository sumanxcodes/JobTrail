'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TextField } from '@/components/ui/TextField';
import { Logo } from '@/components/ui/Logo';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleSendResetEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password?update=true`,
      });
      if (error) throw error;
      setSuccessMsg('Password reset instructions sent! Please check your inbox.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setSuccessMsg('Password updated successfully! You can now log in.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
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
                {isUpdateMode ? 'Update Password' : 'Reset Password'}
              </h1>
              <p
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                }}
              >
                {isUpdateMode
                  ? 'Enter your new secure password below.'
                  : 'Enter your email to receive a password reset link.'}
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
          {!isUpdateMode ? (
            <form
              onSubmit={handleSendResetEmail}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <TextField
                label="Email address"
                type="email"
                value={email}
                onValueChange={setEmail}
                leadingIcon="mail"
              />

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
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleUpdatePassword}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onValueChange={setNewPassword}
                leadingIcon="lock"
                supportingText="Must be at least 6 characters"
              />

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
                {loading ? 'Saving password...' : 'Save New Password'}
              </button>
            </form>
          )}

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
              paddingTop: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsUpdateMode(!isUpdateMode);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--md-sys-color-primary)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
              }}
            >
              {isUpdateMode ? 'Switch to Request Email' : 'Have a recovery token?'}
            </button>

            <Link
              href="/login"
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
