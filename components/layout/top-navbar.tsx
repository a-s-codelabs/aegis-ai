'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  profilePicture?: string | null;
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
  const [divertCallPopupEnabled, setDivertCallPopupEnabled] = useState(true);

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

      // Load divert call popup preference from localStorage
      const savedDivertCallPopup = localStorage.getItem('divertCallPopupEnabled');
      if (savedDivertCallPopup !== null) {
        setDivertCallPopupEnabled(savedDivertCallPopup === 'true');
      } else {
        // Default to true if not set
        setDivertCallPopupEnabled(true);
      }
    }
  }, []);

  // Listen for profile updates and divert call popup changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleProfileUpdate = () => {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          try {
            const session: UserSession = JSON.parse(sessionData);
            setUserSession(session);

            // Update initials if name changed
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
      };

      const handleDivertCallPopupChange = () => {
        const savedDivertCallPopup = localStorage.getItem('divertCallPopupEnabled');
        if (savedDivertCallPopup !== null) {
          setDivertCallPopupEnabled(savedDivertCallPopup === 'true');
        } else {
          setDivertCallPopupEnabled(true);
        }
      };

      // Listen for custom events (from same tab)
      window.addEventListener('profileUpdated', handleProfileUpdate);
      window.addEventListener('divertCallPopupChanged', handleDivertCallPopupChange);
      
      // Also listen for storage events (from other tabs/windows)
      const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === 'userSession') {
          handleProfileUpdate();
        } else if (e.key === 'divertCallPopupEnabled') {
          handleDivertCallPopupChange();
        }
      };
      window.addEventListener('storage', handleStorageEvent);

      // Refresh when page becomes visible (user navigates back)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          handleProfileUpdate();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Also refresh when window gains focus (user navigates back)
      const handleFocus = () => {
        handleProfileUpdate();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
        window.removeEventListener('divertCallPopupChanged', handleDivertCallPopupChange);
        window.removeEventListener('storage', handleStorageEvent);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  // Use absolute positioning when inside iPhone mockup (fullWidth), fixed otherwise
  const positionClasses = isFullWidth
    ? 'absolute top-0 left-0 right-0 w-full z-50 bg-[#0B1121]/90 backdrop-blur-md border-b border-gray-800'
    : 'fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-[#0B1121]/90 backdrop-blur-md border-b border-gray-800 rounded-2xl';

  const handleLogoClick = () => {
    router.push('/home');
  };

  const handleProfileClick = () => {
    router.push('/settings');
  };

  return (
    <header className={positionClasses}>
      <div className="px-5 py-4 flex items-center justify-between">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
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
        </button>
        <button
          onClick={handleProfileClick}
          className="relative cursor-pointer hover:opacity-80 transition-opacity"
        >
          {userSession ? (
            userSession.profilePicture ? (
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#26d9bb]/30">
                <img
                  src={userSession.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-[#26d9bb]/30 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-900">
                  {userInitials}
                </span>
              </div>
            )
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-400">U</span>
            </div>
          )}
          {divertCallPopupEnabled && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-[#26d9bb] rounded-full border-2 border-[#0B1121]"></span>
          )}
        </button>
      </div>
    </header>
  );
}

