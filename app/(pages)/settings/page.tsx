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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [aiMonitoringEnabled, setAiMonitoringEnabled] = useState(true);

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

  return (
    <AppLayout>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-white">Settings</h2>
          <p className="text-gray-400 text-sm mb-6">
            Manage your account and protection preferences
          </p>

          {/* Account Section */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Account
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-100">Name</p>
                  <p className="text-xs text-gray-500">
                    {userSession?.name || 'Not set'}
                  </p>
                </div>
                <button className="text-[#26d9bb] text-sm font-medium hover:text-[#20c4a8] transition-colors">
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    Phone Number
                  </p>
                  <p className="text-xs text-gray-500">
                    {userSession?.phoneNumber || 'Not set'}
                  </p>
                </div>
                <button className="text-[#26d9bb] text-sm font-medium hover:text-[#20c4a8] transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Protection Settings */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Protection Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">
                    AI Monitoring
                  </p>
                  <p className="text-xs text-gray-500">
                    Real-time conversation analysis
                  </p>
                </div>
                <button
                  onClick={() => setAiMonitoringEnabled(!aiMonitoringEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    aiMonitoringEnabled
                      ? 'bg-[#26d9bb]'
                      : 'bg-gray-600'
                  } relative`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      aiMonitoringEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">
                    Auto-block Scams
                  </p>
                  <p className="text-xs text-gray-500">
                    Automatically block detected scam calls
                  </p>
                </div>
                <button
                  onClick={() => setAutoBlockEnabled(!autoBlockEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    autoBlockEnabled ? 'bg-[#26d9bb]' : 'bg-gray-600'
                  } relative`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoBlockEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">
                    Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive alerts for scam calls
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotificationsEnabled(!notificationsEnabled)
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-[#26d9bb]' : 'bg-gray-600'
                  } relative`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              App Settings
            </h3>
            <div className="space-y-2">
              <button className="w-full p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 text-left hover:bg-gray-800/30 transition-colors">
                <span className="text-sm font-medium text-gray-100">
                  About
                </span>
              </button>
              <button className="w-full p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 text-left hover:bg-gray-800/30 transition-colors">
                <span className="text-sm font-medium text-gray-100">
                  Privacy Policy
                </span>
              </button>
              <button className="w-full p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 text-left hover:bg-gray-800/30 transition-colors">
                <span className="text-sm font-medium text-gray-100">
                  Terms of Service
                </span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
          >
            Log Out
          </button>
        </section>
      </div>
    </AppLayout>
  );
}

