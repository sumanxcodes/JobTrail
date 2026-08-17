'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TextField } from '@/components/ui/TextField';
import { FilledButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

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
        redirectTo: `${window.location.origin}/reset-password?update=true`,
      });
      if (error) throw error;
      setSuccessMsg('Password reset instructions sent! Check your inbox.');
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
    <div className="container" style={{ maxWidth: '440px', padding: '2rem 1.25rem' }}>
      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '0.25rem',
            }}
          >
            {isUpdateMode ? 'Update Password' : 'Reset Password'}
          </h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
            {isUpdateMode
              ? 'Enter your new password below.'
              : 'Enter your email to receive a password reset link.'}
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

        {!isUpdateMode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendResetEmail();
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

            <FilledButton onClick={() => handleSendResetEmail()} disabled={loading}>
              {loading ? <CircularProgress /> : 'Send Reset Link'}
            </FilledButton>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePassword();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onValueChange={setNewPassword}
              required
              leadingIcon="lock"
              supportingText="Must be at least 6 characters"
            />

            <FilledButton onClick={() => handleUpdatePassword()} disabled={loading}>
              {loading ? <CircularProgress /> : 'Save New Password'}
            </FilledButton>
          </form>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            paddingTop: '1rem',
          }}
        >
          <TextButton onClick={() => setIsUpdateMode(!isUpdateMode)}>
            {isUpdateMode ? 'Switch to Request Email' : 'Have a recovery token?'}
          </TextButton>

          <Link href="/login">
            <TextButton>Back to Log In</TextButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
