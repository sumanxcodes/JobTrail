'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@/components/ui/CircularProgress';

export default function NewApplicationPage() {
  const router = useRouter();

  useEffect(() => {
    // Seamlessly redirect to the Applications workspace with the M3 Side Sheet open
    router.replace('/applications?new=1');
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
      }}
    >
      <CircularProgress indeterminate />
      <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
        Opening job creator...
      </p>
    </div>
  );
}
