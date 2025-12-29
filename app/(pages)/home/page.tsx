'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface RecentCall {
  id: string;
  number: string;
  name?: string;
  status: 'spam' | 'incoming' | 'outgoing';
  timeAgo: string;
}

interface BlockedNumber {
  id: string;
  number: string;
  riskLevel: 'High' | 'Critical';
  riskPercentage: number;
}

interface WhitelistItem {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
  initials: string;
  type: string;
  color: string;
}

// Home Content Component (to be rendered inside iPhone)
function HomeContent() {
  const router = useRouter();
  const [contactAccessEnabled, setContactAccessEnabled] = useState(true);

  // Load contact access preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContactAccess = localStorage.getItem('contactAccessEnabled');
      if (savedContactAccess !== null) {
        setContactAccessEnabled(savedContactAccess === 'true');
      }

      // Listen for changes to contact access
      const handleContactAccessChange = () => {
        const savedContactAccess = localStorage.getItem('contactAccessEnabled');
        if (savedContactAccess !== null) {
          setContactAccessEnabled(savedContactAccess === 'true');
        }
      };

      window.addEventListener('contactAccessChanged', handleContactAccessChange);
      window.addEventListener('storage', handleContactAccessChange);

      return () => {
        window.removeEventListener('contactAccessChanged', handleContactAccessChange);
        window.removeEventListener('storage', handleContactAccessChange);
      };
    }
  }, []);

  const [recentCalls] = useState<RecentCall[]>([
    {
      id: '1',
      number: '+1 (415) 555-0192',
      status: 'spam',
      timeAgo: '12 mins ago',
    },
    {
      id: '2',
      name: 'Mom',
      number: '+1 (555) 123-4567',
      status: 'incoming',
      timeAgo: '2 hours ago',
    },
    {
      id: '3',
      number: '+1 (202) 555-0143',
      status: 'outgoing',
      timeAgo: '5 hours ago',
    },
  ]);

  const [blockedNumbers] = useState<BlockedNumber[]>([
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

  const [whitelistItems] = useState<WhitelistItem[]>([
    { id: '1', name: 'Bank' },
    { id: '2', name: 'Office' },
    { id: '3', name: 'Doctor' },
  ]);

  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Doe',
      initials: 'JD',
      type: 'Mobile • Protected',
      color: 'purple',
    },
    {
      id: '2',
      name: 'Alice Smith',
      initials: 'AS',
      type: 'Work • Protected',
      color: 'blue',
    },
  ]);

  const getContactColor = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-500/20 text-purple-400';
      case 'blue':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AppLayout fullWidth>
      <div className="relative flex flex-1 flex-col z-10 h-full overflow-y-auto scrollbar-hide">
        <div className="space-y-4 pb-4">
          {/* Hero Section */}
          <section className="text-center pt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#26d9bb]/10 text-[#26d9bb] text-[10px] font-semibold mb-3 border border-[#26d9bb]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#26d9bb] animate-pulse"></span>
              v2.0 Protected
            </div>
            <h2 className="text-lg font-bold mb-2 leading-tight text-white px-2">
              AI-Powered <br />
              <span className="text-[#26d9bb]">Scam Call Detection</span>
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto px-2">
              Real-time protection monitoring your calls using advanced AI
              conversation analysis.
            </p>
          </section>

          {/* Tabs Navigation */}
          <Tabs defaultValue="recent-calls" className="w-full">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto border-b border-gray-800/50 rounded-none overflow-x-auto scrollbar-hide flex-nowrap sticky top-0 bg-[#0B1121]/95 backdrop-blur-sm z-10">
              <TabsTrigger
                value="recent-calls"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#26d9bb] data-[state=active]:border-b-2 data-[state=active]:border-[#26d9bb] text-gray-400 border-b-2 border-transparent rounded-none px-3 py-2 text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0"
              >
                Recent Calls
              </TabsTrigger>
              <TabsTrigger
                value="block-list"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#26d9bb] data-[state=active]:border-b-2 data-[state=active]:border-[#26d9bb] text-gray-400 border-b-2 border-transparent rounded-none px-3 py-2 text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0"
              >
                Block List
              </TabsTrigger>
              <TabsTrigger
                value="whitelist"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#26d9bb] data-[state=active]:border-b-2 data-[state=active]:border-[#26d9bb] text-gray-400 border-b-2 border-transparent rounded-none px-3 py-2 text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0"
              >
                Whitelist
              </TabsTrigger>
              <TabsTrigger
                value="contacts"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#26d9bb] data-[state=active]:border-b-2 data-[state=active]:border-[#26d9bb] text-gray-400 border-b-2 border-transparent rounded-none px-3 py-2 text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0"
              >
                Contacts
              </TabsTrigger>
            </TabsList>

            {/* Recent Calls Tab */}
            <TabsContent value="recent-calls" className="mt-4 space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                  Latest Activity
                </h3>
                <button className="text-[10px] text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors">
                  View All
                </button>
              </div>
              <div className="bg-[#151e32] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                {recentCalls.map((call, index) => (
                  <div
                    key={call.id}
                    className={`p-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                      index < recentCalls.length - 1
                        ? 'border-b border-gray-800/50'
                        : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        call.status === 'spam'
                          ? 'bg-red-500/10'
                          : call.status === 'outgoing'
                          ? 'bg-blue-500/10'
                          : 'bg-emerald-500/10'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          call.status === 'spam'
                            ? 'text-red-500'
                            : call.status === 'outgoing'
                            ? 'text-blue-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {call.status === 'spam'
                          ? 'call_missed'
                          : call.status === 'outgoing'
                          ? 'call_made'
                          : 'call_received'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-100 text-sm truncate">
                        {call.name || call.number}
                      </h4>
                      <p
                        className={`text-[10px] truncate ${
                          call.status === 'spam'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {call.status === 'spam'
                          ? 'Potential Spam'
                          : call.status === 'outgoing'
                          ? 'Outgoing'
                          : 'Incoming'}{' '}
                        • {call.timeAgo}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-600 text-base shrink-0">
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Block List Tab */}
            <TabsContent value="block-list" className="mt-4 space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                  Block List
                </h3>
                <button className="text-[10px] text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-2.5">
                {blockedNumbers.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="bg-[#1e293b] border border-gray-700/50 p-3 rounded-xl shadow-md flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                      <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-red-500 text-[18px]">
                          block
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-100 text-sm truncate">
                          {blocked.number}
                        </h4>
                        <p className="text-[10px] text-red-400 font-medium">
                          Scam Risk: {blocked.riskLevel} ({blocked.riskPercentage}
                          %)
                        </p>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg border border-gray-600 text-[10px] text-gray-300 hover:bg-gray-700 transition-colors shrink-0">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Whitelist Tab */}
            <TabsContent value="whitelist" className="mt-4 space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                  Whitelist
                </h3>
                <button className="text-[10px] text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors">
                  Manage
                </button>
              </div>
              <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3 shadow-lg">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                  <button className="flex flex-col items-center gap-1.5 min-w-[60px] shrink-0">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-[#26d9bb] hover:bg-[#26d9bb]/10 transition-all">
                      <span className="material-symbols-outlined text-gray-400 text-lg">
                        add
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">Add New</span>
                  </button>
                  {whitelistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center gap-1.5 min-w-[60px] shrink-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-500 text-lg">
                          verified_user
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-200 truncate w-full text-center">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="mt-4 space-y-4">
              {contactAccessEnabled ? (
                <>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                      Contacts
                    </h3>
                    <button className="flex items-center gap-1 text-[10px] text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors">
                      <span className="material-symbols-outlined text-[14px]">
                        person_add
                      </span>
                      Add Contact
                    </button>
                  </div>
                  <div className="bg-[#151e32] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                    {contacts.map((contact, index) => (
                      <div
                        key={contact.id}
                        className={`p-3 hover:bg-gray-800/30 transition-colors flex items-center gap-3 ${
                          index < contacts.length - 1
                            ? 'border-b border-gray-800/50'
                            : ''
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${getContactColor(
                            contact.color
                          )} flex items-center justify-center text-xs font-bold shrink-0`}
                        >
                          {contact.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-100 truncate">
                            {contact.name}
                          </h4>
                          <p className="text-[10px] text-gray-500">{contact.type}</p>
                        </div>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0"></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-[#151e32] border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {/* Contact Icon */}
                    <div className="w-16 h-16 rounded-xl bg-[#26d9bb]/20 flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-[#26d9bb] text-3xl"
                        style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
                      >
                        contacts
                      </span>
                    </div>
                    
                    {/* Message */}
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">
                        Contact Access Required
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                        Give contact access to see your contacts and enable better call protection.
                      </p>
                    </div>

                    {/* Button to Settings */}
                    <button
                      onClick={() => router.push('/settings')}
                      className="px-6 py-3 rounded-xl bg-[#26d9bb] text-white font-semibold hover:bg-[#20c4a8] transition-colors flex items-center gap-2 min-h-[44px]"
                    >
                      <span className="material-symbols-outlined text-lg">
                        settings
                      </span>
                      Go to Settings
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

// Main Home Page with Split Layout
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        router.push('/auth/login');
      }
    }
  }, [router]);

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#26d9bb]">
        Anti-scam Home
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Welcome to your Anti-scam dashboard. Here you can manage your call protection settings and monitor suspicious activity.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <p>
          <strong className="text-[#26d9bb]">Recent Calls:</strong> View your call history and identify potential spam calls.
        </p>
        <p>
          <strong className="text-[#26d9bb]">Block List:</strong> Manage numbers that have been flagged as high-risk scams.
        </p>
        <p>
          <strong className="text-[#26d9bb]">Whitelist:</strong> Add trusted contacts that should never be blocked.
        </p>
        <p>
          <strong className="text-[#26d9bb]">Contacts:</strong> View and manage your protected contacts list.
        </p>
      </div>
      <p className="text-sm lg:text-base text-slate-400 italic">
        Use the navigation tabs to switch between different sections. All features are accessible through the top and bottom navigation bars.
      </p>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<HomeContent />}
      leftBasis="60%"
    />
  );
}

