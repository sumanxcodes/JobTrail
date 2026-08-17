'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is an authenticated workspace route
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/applications');

  if (isProtectedRoute) {
    // In protected workspace, AppShell handles the M3 Navigation Rail & bottom bar directly
    return <>{children}</>;
  }

  // In public marketing & auth routes, render top Navbar & Footer
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
