'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  profilePicture?: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [contactAccessEnabled, setContactAccessEnabled] = useState(true);
  const [divertCallPopupEnabled, setDivertCallPopupEnabled] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        router.push('/auth/login');
        return;
      }

      try {
        const session: UserSession = JSON.parse(sessionData);
        setUserSession(session);
        
        // Load contact access preference from localStorage
        const savedContactAccess = localStorage.getItem('contactAccessEnabled');
        if (savedContactAccess !== null) {
          setContactAccessEnabled(savedContactAccess === 'true');
        }
      } catch (error) {
        console.error('[Settings] Error parsing session:', error);
        router.push('/auth/login');
      }
    }
  }, [router]);

  // Listen for storage changes to update profile when edited
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          try {
            const session: UserSession = JSON.parse(sessionData);
            setUserSession(session);
          } catch (error) {
            console.error('[Settings] Error parsing session:', error);
          }
        }
      };

      // Listen for storage events (from other tabs/windows)
      window.addEventListener('storage', handleStorageChange);

      // Also listen for custom event (from same tab)
      window.addEventListener('profileUpdated', handleStorageChange);

      // Refresh when page becomes visible (user navigates back)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          handleStorageChange();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Also refresh when window gains focus (user navigates back)
      const handleFocus = () => {
        handleStorageChange();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('profileUpdated', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  const handleSignOutClick = () => {
    setShowSignOutDialog(true);
  };

  const handleConfirmSignOut = () => {
    if (typeof window !== 'undefined') {
      // Clear all auth-related data
      localStorage.removeItem('userSession');
      // Clear any other auth tokens if they exist
      // Add additional cleanup as needed
      
      // Redirect to login
      router.push('/auth/login');
    }
  };

  // Get user initials from name or phone number
  const getUserInitials = () => {
    if (!userSession) return 'U';

    if (userSession.name) {
      const names = userSession.name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return userSession.name[0].toUpperCase();
    }

    // Fallback to phone number last digit
    return userSession.phoneNumber?.slice(-1) || 'U';
  };

  // Format phone number for display
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return 'Not set';
    // Basic formatting - you can enhance this with a proper formatter
    return phone;
  };

  // Get display name
  const getDisplayName = () => {
    return userSession?.name || 'User';
  };

  // Settings Content Component (to be rendered inside iPhone)
  function SettingsContent() {
    return (
      <AppLayout fullWidth>
      <div className="flex flex-col min-h-full relative">
        {/* User Profile Section */}
        <section className="w-full flex flex-col items-center">
          {/* Avatar with Edit Icon */}
          <div className="relative mb-4">
            {userSession?.profilePicture ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700/50">
                <img
                  src={userSession.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-gray-700/50">
                <span className="text-3xl font-semibold text-white">
                  {getUserInitials()}
                </span>
              </div>
            )}
            {/* Edit Icon Overlay */}
            <button
              onClick={() => router.push('/settings/edit')}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#26d9bb] flex items-center justify-center border-2 border-[#0B1121] hover:bg-[#20c4a8] transition-colors shadow-lg z-10"
              aria-label="Edit profile"
            >
              <span
                className="material-symbols-outlined text-white text-lg leading-none"
                style={{ fontVariationSettings: '"FILL" 0, "wght" 500' }}
              >
                edit
              </span>
            </button>
          </div>

          {/* User Name */}
          <h2 className="text-xl font-semibold text-white mb-1">
            {getDisplayName()}
          </h2>

          {/* Phone Number */}
          <p className="text-sm text-gray-400">
            {formatPhoneNumber(userSession?.phoneNumber)}
          </p>
        </section>

        {/* General Preferences Section */}
        <section className="w-full space-y-4 flex-1 mt-10">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            General Preferences
          </h3>

          {/* Contact Access Preference Card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#151e32] border border-gray-800/50">
            <div className="flex items-center gap-4 flex-1">
              {/* Contact Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#26d9bb]/20 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[#26d9bb] text-xl"
                  style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
                >
                  contacts
                </span>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-0.5">
                  Contact Access
                </p>
                <p className="text-xs text-gray-400">
                  Allow app to sync contacts
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => {
                const newValue = !contactAccessEnabled;
                setContactAccessEnabled(newValue);
                // Persist to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('contactAccessEnabled', String(newValue));
                  // Dispatch event to notify other components
                  window.dispatchEvent(new Event('contactAccessChanged'));
                }
              }}
              className={`w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                contactAccessEnabled
                  ? 'bg-[#26d9bb]'
                  : 'bg-gray-600'
              } relative`}
              aria-label={contactAccessEnabled ? 'Disable contact access' : 'Enable contact access'}
              role="switch"
              aria-checked={contactAccessEnabled}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                  contactAccessEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Divert Call Popup Preference Card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#151e32] border border-gray-800/50">
            <div className="flex items-center gap-4 flex-1">
              {/* Divert Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#26d9bb]/20 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[#26d9bb] text-xl"
                  style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
                >
                  call_split
                </span>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-0.5">
                  Divert Call Popup
                </p>
                <p className="text-xs text-gray-400">
                  Show popup for unknown numbers
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setDivertCallPopupEnabled(!divertCallPopupEnabled)}
              className={`w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                divertCallPopupEnabled
                  ? 'bg-[#26d9bb]'
                  : 'bg-gray-600'
              } relative`}
              aria-label={divertCallPopupEnabled ? 'Disable divert call popup' : 'Enable divert call popup'}
              role="switch"
              aria-checked={divertCallPopupEnabled}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                  divertCallPopupEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Bottom Section - Pushed to bottom */}
        <div className="mt-auto w-full">
          {/* Visual Separator */}
          <div className="w-full border-t border-gray-800/50 my-4" />

          {/* Sign Out Button - At Bottom */}
          <section className="w-full pb-4 flex justify-center">
            <button
              onClick={handleSignOutClick}
              className="px-6 py-2.5 rounded-lg bg-transparent text-red-400 font-medium hover:bg-red-500/10 active:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]"
              aria-label="Sign out"
            >
              <span>Sign Out</span>
              <span
                className="material-symbols-outlined text-red-400 text-base"
                style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
              >
                logout
              </span>
            </button>
          </section>

          {/* App Information */}
          <section className="w-full">
            <p className="text-xs text-gray-500 text-center">
              • Anti-Scam Protection Active
            </p>
          </section>
        </div>
      </div>

      {/* Sign Out Confirmation Modal - Custom inline modal within iPhone frame */}
      {showSignOutDialog && (
        <>
          {/* Overlay */}
          <div 
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => setShowSignOutDialog(false)}
          />
          
          {/* Modal Content */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-[#151e32] border border-gray-800/50 rounded-lg p-6 w-full max-w-[calc(100%-2rem)] shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sign out?
                </h3>
                <p className="text-sm text-gray-400">
                  You'll need to sign in again to continue using Anti-Scam protection.
                </p>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6">
                <button
                  onClick={() => setShowSignOutDialog(false)}
                  className="px-4 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-white font-medium hover:bg-[#2d3a52] transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSignOut}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors min-h-[44px]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
    );
  }

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
        Settings
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Manage your account preferences and app settings. Control contact access, notification preferences, and more.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            contacts
          </span>
          <div>
            <strong className="text-[#26d9bb]">Contact Access:</strong> Allow the app to sync and access your contacts for better call protection.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            call_split
          </span>
          <div>
            <strong className="text-[#26d9bb]">Divert Call Popup:</strong> Enable popup notifications when unknown numbers call.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            account_circle
          </span>
          <div>
            <strong className="text-[#26d9bb]">Profile Management:</strong> Update your profile information and account settings.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<SettingsContent />}
      leftBasis="60%"
    />
  );
}

