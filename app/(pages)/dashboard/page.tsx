'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  role?: 'admin' | 'user';
}

export default function DashboardPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
        // Check if user is admin (you can modify this logic based on your needs)
        // For now, defaulting to user role
        setIsAdmin(session.role === 'admin');
      } catch (error) {
        console.error('[Dashboard] Error parsing session:', error);
        router.push('/auth/login');
      }
    }
  }, [router]);

  // Default to user dashboard
  const showAdminDashboard = isAdmin;

  return (
    <AppLayout>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-white">
            {showAdminDashboard ? 'Admin Dashboard' : 'User Dashboard'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {showAdminDashboard
              ? 'Manage all users and system settings'
              : 'View your call statistics and protection status'}
          </p>

          {showAdminDashboard ? (
            <AdminDashboardContent />
          ) : (
            <UserDashboardContent userSession={userSession} />
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function AdminDashboardContent() {
  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">1,234</p>
        </div>
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Scam Calls Blocked</p>
          <p className="text-2xl font-bold text-[#26d9bb]">5,678</p>
        </div>
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Active Sessions</p>
          <p className="text-2xl font-bold text-white">890</p>
        </div>
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">System Health</p>
          <p className="text-2xl font-bold text-emerald-500">98%</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 text-left hover:bg-gray-800/30 transition-colors">
            <span className="text-sm font-medium text-gray-100">
              Manage Users
            </span>
          </button>
          <button className="w-full p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 text-left hover:bg-gray-800/30 transition-colors">
            <span className="text-sm font-medium text-gray-100">
              View System Logs
            </span>
          </button>
          <button className="w-full p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 text-left hover:bg-gray-800/30 transition-colors">
            <span className="text-sm font-medium text-gray-100">
              Configure Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDashboardContent({
  userSession,
}: {
  userSession: UserSession | null;
}) {
  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total Calls</p>
          <p className="text-2xl font-bold text-white">42</p>
        </div>
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Scam Blocked</p>
          <p className="text-2xl font-bold text-red-500">8</p>
        </div>
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Safe Calls</p>
          <p className="text-2xl font-bold text-emerald-500">34</p>
        </div>
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Protection</p>
          <p className="text-2xl font-bold text-[#26d9bb]">Active</p>
        </div>
      </div>

      {/* Protection Status */}
      <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Protection Status
          </h3>
          <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">AI Monitoring</span>
            <span className="text-sm font-medium text-emerald-500">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Real-time Analysis</span>
            <span className="text-sm font-medium text-emerald-500">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Auto-block Scams</span>
            <span className="text-sm font-medium text-emerald-500">On</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-sm">
                block
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-100">
                Scam call blocked
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b] border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-sm">
                check_circle
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-100">
                Safe call verified
              </p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

