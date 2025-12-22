'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [contactAccessEnabled, setContactAccessEnabled] = useState(true);
  const [divertCallPopupEnabled, setDivertCallPopupEnabled] = useState(true);

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
      } catch (error) {
        console.error('[Settings] Error parsing session:', error);
        router.push('/auth/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userSession');
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

  return (
    <AppLayout>
      <div className="flex flex-col items-center space-y-8 pb-8">
        {/* User Profile Section */}
        <section className="w-full flex flex-col items-center space-y-4 pt-4">
          {/* Avatar with Edit Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-gray-700/50">
              <span className="text-3xl font-semibold text-white">
                {getUserInitials()}
              </span>
            </div>
            {/* Edit Icon Overlay */}
            <button
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
          <h2 className="text-xl font-semibold text-white">
            {getDisplayName()}
          </h2>

          {/* Phone Number */}
          <p className="text-sm text-gray-400">
            {formatPhoneNumber(userSession?.phoneNumber)}
          </p>
        </section>

        {/* General Preferences Section */}
        <section className="w-full space-y-4">
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
              onClick={() => setContactAccessEnabled(!contactAccessEnabled)}
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

        {/* Sign Out Button */}
        <section className="w-full pt-4">
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-xl bg-transparent border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
            aria-label="Sign out"
          >
            <span>Sign Out</span>
            <span
              className="material-symbols-outlined text-red-400 text-lg"
              style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
            >
              logout
            </span>
          </button>
        </section>

        {/* App Information */}
        <section className="w-full pt-2">
          <p className="text-xs text-gray-500 text-center">
            • Anti-Scam Protection Active
          </p>
        </section>
      </div>
    </AppLayout>
  );
}

