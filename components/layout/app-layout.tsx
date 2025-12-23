'use client';

import { ReactNode } from 'react';
import { TopNavbar } from './top-navbar';
import { BottomNavbar } from './bottom-navbar';

interface AppLayoutProps {
  children: ReactNode;
  hideTopNavbar?: boolean;
  hideBottomNavbar?: boolean;
  navbarTitle?: string;
  navbarIcon?: string;
  // When true, use full width (useful for embedded/mobile mock views)
  fullWidth?: boolean;
}

export function AppLayout({
  children,
  hideTopNavbar = false,
  hideBottomNavbar = false,
  navbarTitle,
  navbarIcon,
  fullWidth = false,
}: AppLayoutProps) {
  const mainWidthClasses = fullWidth
    ? 'max-w-full w-full'
    : 'max-w-lg mx-auto w-full';

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0B1121] text-gray-100">
      {/* Background layers - matching register page pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#111827] to-[#020617]" />
      <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-full bg-gradient-to-br from-teal-900/10 to-transparent opacity-50" />
      <div
        className="absolute inset-0 bg-[url('https://placeholder.pics/svg/20')] bg-repeat opacity-[0.03]"
        style={{ backgroundSize: '24px 24px', filter: 'invert(1)' }}
      />

      {/* Top Navbar */}
      {!hideTopNavbar && <TopNavbar title={navbarTitle} icon={navbarIcon} />}

      {/* Main Content */}
      <main className={`relative z-10 flex-1 px-4 pb-20 pt-4 ${mainWidthClasses} ${!hideTopNavbar ? 'pt-28' : ''}`}>
        {children}
      </main>

      {/* Bottom Navbar */}
      {!hideBottomNavbar && <BottomNavbar />}
    </div>
  );
}

