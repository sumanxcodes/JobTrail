'use client';

import React from 'react';
import { NavigationRail } from './NavigationRail';
import { BottomNavigationBar } from './BottomNavigationBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="m3-app-layout">
      {/* Desktop/Tablet M3 Vertical Navigation Rail */}
      <NavigationRail />

      {/* Main Workspace Canvas */}
      <div className="m3-workspace-canvas">
        <main style={{ flex: 1 }}>{children}</main>
      </div>

      {/* Mobile M3 Bottom Navigation Bar (< 768px) */}
      <BottomNavigationBar />
    </div>
  );
}
