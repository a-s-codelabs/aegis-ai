'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
}

interface TopNavbarProps {
  title?: string;
  icon?: string;
  isFullWidth?: boolean;
}

export function TopNavbar({ title = 'Anti-Scam', icon = 'shield', isFullWidth = false }: TopNavbarProps) {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        try {
          const session: UserSession = JSON.parse(sessionData);
          setUserSession(session);

          // Get user initials from name or phone number
          if (session.name) {
            const names = session.name.trim().split(' ');
            if (names.length >= 2) {
              setUserInitials(
                (names[0][0] + names[names.length - 1][0]).toUpperCase()
              );
            } else {
              setUserInitials(session.name[0].toUpperCase());
            }
          } else if (session.phoneNumber) {
            setUserInitials(session.phoneNumber.slice(-1));
          }
        } catch (error) {
          console.error('[TopNavbar] Error parsing session:', error);
        }
      }
    }
  }, []);

  // Use absolute positioning when inside iPhone mockup (fullWidth), fixed otherwise
  const positionClasses = isFullWidth
    ? 'absolute top-0 left-0 right-0 w-full z-50 bg-[#0B1121]/90 backdrop-blur-md border-b border-gray-800'
    : 'fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-[#0B1121]/90 backdrop-blur-md border-b border-gray-800 rounded-2xl';

  return (
    <header className={positionClasses}>
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#26d9bb]/20 rounded-full flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[#26d9bb] text-xl"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
            >
              {icon}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {title}
          </h1>
        </div>
        <div className="relative">
          {userSession ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-[#26d9bb]/30 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-900">
                {userInitials}
              </span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-400">U</span>
            </div>
          )}
          <span className="absolute top-0 right-0 w-3 h-3 bg-[#26d9bb] rounded-full border-2 border-[#0B1121]"></span>
        </div>
      </div>
    </header>
  );
}

