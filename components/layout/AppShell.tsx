'use client';

import React from 'react';
import { NavigationRail } from './NavigationRail';
import { BottomNavigationBar } from './BottomNavigationBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="m3-app-layout">
      {/* Desktop/Tablet M3 Vertical Navigation Rail */}
      <NavigationRail />

      {/* Main Workspace Floating Canvas (28px M3 Curvature) */}
      <div className="m3-workspace-canvas">
        <div className="m3-canvas-surface">
          {children}
        </div>
      </div>

      {/* Mobile M3 Bottom Navigation Bar (< 768px) */}
      <BottomNavigationBar />
    </div>
  );
}
