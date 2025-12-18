'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

interface BlockedNumber {
  id: string;
  number: string;
  riskLevel: string;
  riskPercentage: number;
}

export default function ManagePage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        router.push('/auth/login');
        return;
      }

      // Load contacts and blocked numbers
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    // Simulate loading data
    setTimeout(() => {
      setContacts([
        { id: '1', name: 'John Doe', phoneNumber: '+1 (555) 123-4567' },
        { id: '2', name: 'Jane Smith', phoneNumber: '+1 (555) 987-6543' },
      ]);
      setBlockedNumbers([
        {
          id: '1',
          number: '+1 (724) 719-4042',
          riskLevel: 'High',
          riskPercentage: 95,
        },
        {
          id: '2',
          number: '+1 (184) 768-4419',
          riskLevel: 'Critical',
          riskPercentage: 98,
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-white">Manage</h2>
          <p className="text-gray-400 text-sm mb-6">
            Manage your contacts, blocked numbers, and whitelist
          </p>

          {/* Contacts Section */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Contacts
              </h3>
              <button className="text-xs text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">
                  person_add
                </span>
                Add Contact
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No contacts yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-100">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.phoneNumber}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Numbers Section */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Blocked Numbers
              </h3>
              <button className="text-xs text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors">
                View All
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            ) : blockedNumbers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No blocked numbers</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedNumbers.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b] border border-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-[20px]">
                          block
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-100">
                          {blocked.number}
                        </p>
                        <p className="text-xs text-red-400 font-medium">
                          Scam Risk: {blocked.riskLevel} ({blocked.riskPercentage}%)
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-gray-600 text-xs text-gray-300 hover:bg-gray-700 transition-colors">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Whitelist Section */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Whitelist
              </h3>
              <button className="text-xs text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors">
                Manage
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
              <button className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-[#26d9bb] hover:bg-[#26d9bb]/10 transition-all">
                  <span className="material-symbols-outlined text-gray-400">
                    add
                  </span>
                </div>
                <span className="text-xs text-gray-400">Add New</span>
              </button>
              <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500">
                    verified_user
                  </span>
                </div>
                <span className="text-xs text-gray-200 truncate w-full text-center">
                  Bank
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500">
                    verified_user
                  </span>
                </div>
                <span className="text-xs text-gray-200 truncate w-full text-center">
                  Office
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500">
                    verified_user
                  </span>
                </div>
                <span className="text-xs text-gray-200 truncate w-full text-center">
                  Doctor
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

