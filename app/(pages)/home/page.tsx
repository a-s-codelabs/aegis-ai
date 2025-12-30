'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MobileModal } from '@/components/ui/mobile-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getContacts, saveContacts, addContact as addContactUtil, normalizePhoneNumber, seedDummyContacts, seedDummyBlocklist } from '@/lib/utils/contacts';

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
  number?: string;
}

interface Contact {
  id: string;
  name: string;
  initials: string;
  type: string;
  color: string;
  phoneNumber?: string;
}

// Home Content Component (to be rendered inside iPhone)
function HomeContent() {
  const router = useRouter();
  const [contactAccessEnabled, setContactAccessEnabled] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check if user is new and load contact access preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is newly registered
      const newUserFlag = localStorage.getItem('isNewUser');
      if (newUserFlag === 'true') {
        setIsNewUser(true);
        // Clear the flag after checking
        localStorage.removeItem('isNewUser');
      }

      // Check if user has any call logs, blocklist, or whitelist
      const callLogs = localStorage.getItem('callLogs');
      const blocklist = localStorage.getItem('blocklist');
      const whitelist = localStorage.getItem('whitelistItems');
      
      // If no call activity exists, treat as new user
      if (!callLogs || callLogs === '[]' || (!blocklist || blocklist === '[]') && (!whitelist || whitelist === '[]')) {
        setIsNewUser(true);
      }

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

  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([]);

      // Load recent calls and blocklist from localStorage
      useEffect(() => {
        if (typeof window !== 'undefined') {
          // Only seed dummy data if user is not new and has contact access enabled
          const contactAccess = localStorage.getItem('contactAccessEnabled');
          const hasContactAccess = contactAccess === null || contactAccess === 'true';
          
          if (!isNewUser) {
            // Only seed contacts if contact access is enabled
            if (hasContactAccess) {
              seedDummyContacts();
            }
            seedDummyBlocklist();
          }

          // Function to load and format recent calls
          const loadRecentCalls = () => {
            const callLogsData = localStorage.getItem('callLogs');
            if (callLogsData) {
              try {
                const callLogs = JSON.parse(callLogsData);
                // Sort by timestamp descending (newest first) before taking first 6
                const sortedLogs = [...callLogs].sort((a: any, b: any) => {
                  const timeA = new Date(a.timestamp).getTime();
                  const timeB = new Date(b.timestamp).getTime();
                  return timeB - timeA; // Descending order (newest first)
                });
                
                // Convert call logs to recent calls format (show first 6 after sorting)
                const recent: RecentCall[] = sortedLogs.slice(0, 6).map((log: any, index: number) => {
                  const timestamp = new Date(log.timestamp);
                  const now = new Date();
                  const diffMs = now.getTime() - timestamp.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMins / 60);
                  
                  let timeAgo = '';
                  if (diffMins < 1) {
                    timeAgo = 'Just now';
                  } else if (diffMins < 60) {
                    timeAgo = `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
                  } else {
                    timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                  }

                  // Determine status with explicit type
                  let status: 'spam' | 'incoming' | 'outgoing';
                  if (log.status === 'scam') {
                    status = 'spam';
                  } else if (log.status === 'safe') {
                    status = 'incoming';
                  } else {
                    status = 'outgoing';
                  }

                  return {
                    id: log.id || `call-${index}`,
                    number: log.number,
                    status,
                    timeAgo,
                  };
                });
                setRecentCalls(recent);
              } catch (error) {
                console.error('[Home] Error parsing call logs:', error);
              }
            } else {
              setRecentCalls([]);
            }
          };

          // Load recent calls initially
          loadRecentCalls();

      // Function to load blocklist
      const loadBlocklist = () => {
        const blocklistData = localStorage.getItem('blocklist');
        if (blocklistData) {
          try {
            const blocklist = JSON.parse(blocklistData);
            // Convert blocklist to blocked numbers format
            // We need to get risk info from call logs
            const callLogsData2 = localStorage.getItem('callLogs');
            const callLogs = callLogsData2 ? JSON.parse(callLogsData2) : [];
            
            const blocked = blocklist.map((number: string, index: number) => {
              // Find the call log entry for this number to get risk info
              const callLog = callLogs.find((log: any) => log.number === number);
              const riskPercentage = callLog?.risk || 95;
              
              return {
                id: `blocked-${index}`,
                number,
                riskLevel: riskPercentage >= 90 ? 'Critical' : 'High',
                riskPercentage,
              };
            });
            setBlockedNumbers(blocked);
          } catch (error) {
            console.error('[Home] Error parsing blocklist:', error);
          }
        } else {
          setBlockedNumbers([]);
        }
      };

      // Load blocklist initially (with small delay to ensure seed completes)
      setTimeout(() => {
        loadBlocklist();
      }, 100);

      // Listen for storage changes and custom events to update in real-time
      const handleStorageChange = () => {
        // Reload recent calls (using the same function to ensure consistent sorting)
        loadRecentCalls();

        // Reload blocklist
        loadBlocklist();
      };

      const handleCallLogsUpdated = () => {
        handleStorageChange();
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('callLogsUpdated', handleCallLogsUpdated);
      window.addEventListener('blocklistUpdated', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('callLogsUpdated', handleCallLogsUpdated);
        window.removeEventListener('blocklistUpdated', handleStorageChange);
      };
    }
  }, []);

  const [whitelistItems, setWhitelistItems] = useState<WhitelistItem[]>([]);
  const [isAddWhitelistDialogOpen, setIsAddWhitelistDialogOpen] = useState(false);
  const [isViewWhitelistDialogOpen, setIsViewWhitelistDialogOpen] = useState(false);
  const [selectedWhitelistItem, setSelectedWhitelistItem] = useState<WhitelistItem | null>(null);
  const [newWhitelistName, setNewWhitelistName] = useState('');
  const [newWhitelistNumber, setNewWhitelistNumber] = useState('');
  const [editingPhoneNumber, setEditingPhoneNumber] = useState('');

  // Contact management state
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhoneNumber, setNewContactPhoneNumber] = useState('');

  // Load whitelist items from localStorage on mount and listen for changes
  const loadWhitelistItems = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('whitelistItems');
        if (saved) {
          const parsed = JSON.parse(saved) as WhitelistItem[];
          setWhitelistItems(parsed);
        } else {
          // Initialize with default items if no saved data
          const defaultItems: WhitelistItem[] = [
            { id: '1', name: 'Bank' },
            { id: '2', name: 'Office' },
            { id: '3', name: 'Doctor' },
          ];
          setWhitelistItems(defaultItems);
          localStorage.setItem('whitelistItems', JSON.stringify(defaultItems));
        }
      } catch (error) {
        console.error('[Whitelist] Error loading whitelist items:', error);
        // Fallback to default items
        const defaultItems: WhitelistItem[] = [
          { id: '1', name: 'Bank' },
          { id: '2', name: 'Office' },
          { id: '3', name: 'Doctor' },
        ];
        setWhitelistItems(defaultItems);
      }
    }
  };

  useEffect(() => {
    loadWhitelistItems();

    // Listen for storage changes to reload whitelist items (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'whitelistItems') {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          loadWhitelistItems();
        }, 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync editing phone number when selected item changes
  useEffect(() => {
    if (selectedWhitelistItem) {
      setEditingPhoneNumber(selectedWhitelistItem.number || '');
    }
  }, [selectedWhitelistItem]);

  // Note: Saving to localStorage is now handled directly in handleAddWhitelist
  // to avoid race conditions and ensure immediate persistence

  const [contacts, setContacts] = useState<Contact[]>([]);

  // Helper function to generate initials from name
  const generateInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to generate color from name
  const generateColor = (name: string): string => {
    const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'indigo', 'teal'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Load contacts from localStorage
  const loadContacts = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedContacts = getContacts();
        // Convert utility Contact format to display Contact format
        const displayContacts: Contact[] = savedContacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          initials: generateInitials(contact.name),
          type: contact.phoneNumber ? `${contact.phoneNumber} • Protected` : 'Protected',
          color: generateColor(contact.name),
          phoneNumber: contact.phoneNumber,
        }));
        setContacts(displayContacts);
      } catch (error) {
        console.error('[Contacts] Error loading contacts:', error);
        setContacts([]);
      }
    }
  };

  // Load contacts on mount and listen for changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check contact access and seed dummy contacts if enabled
      const contactAccess = localStorage.getItem('contactAccessEnabled');
      const hasContactAccess = contactAccess === null || contactAccess === 'true';
      
      if (hasContactAccess) {
        seedDummyContacts();
        // Reload contacts after seeding
        setTimeout(() => {
          loadContacts();
        }, 100);
      } else {
        loadContacts();
      }
    }

      // Listen for storage changes and contact access changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'aegis-ai-contacts' || e.key === 'contactAccessEnabled') {
          setTimeout(() => {
            const contactAccess = localStorage.getItem('contactAccessEnabled');
            const hasContactAccess = contactAccess === null || contactAccess === 'true';
            if (hasContactAccess) {
              seedDummyContacts();
            }
            loadContacts();
          }, 0);
        }
      };

      const handleContactAccessChange = () => {
        const contactAccess = localStorage.getItem('contactAccessEnabled');
        const hasContactAccess = contactAccess === null || contactAccess === 'true';
        if (hasContactAccess) {
          seedDummyContacts();
          setTimeout(() => {
            loadContacts();
          }, 100);
        } else {
          loadContacts();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('contactAccessChanged', handleContactAccessChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('contactAccessChanged', handleContactAccessChange);
      };
  }, []);

  const getContactColor = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-500/20 text-purple-400';
      case 'blue':
        return 'bg-blue-500/20 text-blue-400';
      case 'green':
        return 'bg-green-500/20 text-green-400';
      case 'orange':
        return 'bg-orange-500/20 text-orange-400';
      case 'pink':
        return 'bg-pink-500/20 text-pink-400';
      case 'indigo':
        return 'bg-indigo-500/20 text-indigo-400';
      case 'teal':
        return 'bg-teal-500/20 text-teal-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Handle adding a new contact
  const handleAddContact = () => {
    const trimmedName = newContactName.trim();
    
    if (!trimmedName) {
      console.error('[Contacts] Name is required');
      return;
    }

    const trimmedPhoneNumber = newContactPhoneNumber.trim();
    
    if (!trimmedPhoneNumber) {
      console.error('[Contacts] Phone number is required');
      return;
    }

    // Normalize phone number
    const normalizedPhoneNumber = normalizePhoneNumber(trimmedPhoneNumber);

    console.log('[Contacts] Adding contact:', { name: trimmedName, phoneNumber: normalizedPhoneNumber });

    // Add contact using utility function
    const newContact = addContactUtil({
      name: trimmedName,
      phoneNumber: normalizedPhoneNumber,
    });

    // Reload contacts to update UI
    loadContacts();

    // Clear form and close dialog
    setNewContactName('');
    setNewContactPhoneNumber('');
    setIsAddContactDialogOpen(false);
  };

  const handleAddWhitelist = () => {
    const trimmedName = newWhitelistName.trim();
    
    if (!trimmedName) {
      console.error('[Whitelist] Name is required');
      return;
    }

    const trimmedNumber = newWhitelistNumber.trim() || undefined;

    console.log('[Whitelist] Adding item:', { name: trimmedName, number: trimmedNumber });

    // Update state using functional update to ensure we have the latest state
    setWhitelistItems((prevItems) => {
      console.log('[Whitelist] Current items in state:', prevItems);
      
      // Check if an item with the same name already exists (case-insensitive)
      const existingIndex = prevItems.findIndex(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
      );

      let finalItems: WhitelistItem[];

      if (existingIndex !== -1) {
        // Update existing item
        console.log('[Whitelist] Updating existing item at index:', existingIndex);
        finalItems = prevItems.map((item, idx) => 
          idx === existingIndex 
            ? { ...item, name: trimmedName, number: trimmedNumber }
            : item
        );
      } else {
        // Create new item
        console.log('[Whitelist] Creating new item');
        const newItem: WhitelistItem = {
          id: Date.now().toString(),
          name: trimmedName,
          number: trimmedNumber,
        };
        finalItems = [...prevItems, newItem];
      }

      console.log('[Whitelist] Final items:', finalItems);
      
      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('whitelistItems', JSON.stringify(finalItems));
          console.log('[Whitelist] Saved items to localStorage:', finalItems);
          // Note: No need to dispatch event - state is already updated above
          // The storage event will handle cross-tab synchronization
        } catch (error) {
          console.error('[Whitelist] Error saving to localStorage:', error);
        }
      }
      
      return finalItems;
    });

    // Clear form and close dialog
    setNewWhitelistName('');
    setNewWhitelistNumber('');
    setIsAddWhitelistDialogOpen(false);
  };

  const handleWhitelistItemClick = (item: WhitelistItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[Whitelist] Clicked item:', item);
    setSelectedWhitelistItem(item);
    setEditingPhoneNumber(item.number || '');
    setIsViewWhitelistDialogOpen(true);
  };

  const handleUpdateWhitelistNumber = () => {
    if (!selectedWhitelistItem) {
      console.error('[Whitelist] No selected item to update');
      return;
    }

    const trimmedNumber = editingPhoneNumber.trim() || undefined;
    console.log('[Whitelist] Updating phone number:', { 
      itemId: selectedWhitelistItem.id, 
      itemName: selectedWhitelistItem.name,
      newNumber: trimmedNumber 
    });

    setWhitelistItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === selectedWhitelistItem.id
          ? { ...item, number: trimmedNumber }
          : item
      );

      console.log('[Whitelist] Updated items:', updatedItems);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('whitelistItems', JSON.stringify(updatedItems));
          console.log('[Whitelist] Saved to localStorage successfully');
        } catch (error) {
          console.error('[Whitelist] Error saving to localStorage:', error);
        }
      }

      return updatedItems;
    });

    // Update selected item to reflect the change
    setSelectedWhitelistItem({ ...selectedWhitelistItem, number: trimmedNumber });
    
    // Close the dialog after saving
    setIsViewWhitelistDialogOpen(false);
    setEditingPhoneNumber('');
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
                {recentCalls.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-gray-500 text-4xl mb-2 block">
                      call_missed
                    </span>
                    <p className="text-gray-400 text-sm">No recent calls yet</p>
                    <p className="text-gray-500 text-xs mt-1">Incoming calls will appear here</p>
                  </div>
                ) : (
                  recentCalls.map((call, index) => (
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
                  ))
                )}
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
              {blockedNumbers.length === 0 ? (
                <div className="bg-[#151e32] border border-gray-800 rounded-xl p-6 text-center">
                  <span className="material-symbols-outlined text-gray-500 text-4xl mb-2 block">
                    block
                  </span>
                  <p className="text-gray-400 text-sm">No blocked numbers yet</p>
                  <p className="text-gray-500 text-xs mt-1">Blocked numbers will appear here</p>
                </div>
              ) : (
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
              )}
            </TabsContent>

            {/* Whitelist Tab */}
            <TabsContent value="whitelist" className="mt-4 space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                  Whitelist
                </h3>
              </div>
              <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3 shadow-lg">
                <div className="flex flex-wrap gap-2.5 sm:gap-3 pb-1">
                  <button
                    onClick={() => setIsAddWhitelistDialogOpen(true)}
                    className="flex flex-col items-center gap-1.5 w-[75px] sm:w-[85px] shrink-0"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-[#26d9bb] hover:bg-[#26d9bb]/10 transition-all shrink-0">
                      <span className="material-symbols-outlined text-gray-400 text-lg">
                        add
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 text-center leading-tight break-words">Add New</span>
                  </button>
                  {whitelistItems.length > 0 ? (
                    whitelistItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={(e) => handleWhitelistItemClick(item, e)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="flex flex-col items-center gap-1.5 w-[75px] sm:w-[85px] shrink-0 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#26d9bb]/50 rounded-lg p-1.5"
                        type="button"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-emerald-500 text-lg">
                            verified_user
                          </span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-0.5 min-w-0 px-0.5">
                          <span className="text-[10px] sm:text-[11px] font-medium text-gray-200 text-center break-words leading-tight w-full">
                            {item.name}
                          </span>
                          {item.number && item.number.trim() && (
                            <span className="text-[8px] sm:text-[9px] text-gray-400 text-center break-all leading-tight w-full hyphens-auto">
                              {item.number}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-400 text-center w-full py-2">
                      No whitelist items yet
                    </div>
                  )}
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
                    <button 
                      onClick={() => setIsAddContactDialogOpen(true)}
                      className="flex items-center gap-1 text-[10px] text-[#26d9bb] hover:text-[#20c4a8] font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        person_add
                      </span>
                      Add Contact
                    </button>
                  </div>
                  <div className="bg-[#151e32] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                    {contacts.length === 0 ? (
                      <div className="p-6 text-center">
                        <span className="material-symbols-outlined text-gray-500 text-4xl mb-2 block">
                          contacts
                        </span>
                        <p className="text-gray-400 text-sm">No contacts yet</p>
                        <p className="text-gray-500 text-xs mt-1">Add contacts to get started</p>
                      </div>
                    ) : (
                      contacts.map((contact, index) => (
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
                      ))
                    )}
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

      {/* Add Whitelist Dialog - Outside scrollable area */}
      <MobileModal
        open={isAddWhitelistDialogOpen}
        onOpenChange={setIsAddWhitelistDialogOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (newWhitelistName.trim()) {
              handleAddWhitelist();
            }
          }}
          className="space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Add New Whitelist</h2>
            <p className="text-sm text-gray-400">
              Add a trusted contact or number to your whitelist. Calls from these numbers will not be blocked.
            </p>
          </div>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Name
              </label>
              <Input
                placeholder="e.g., Bank, Office, Doctor"
                value={newWhitelistName}
                onChange={(e) => setNewWhitelistName(e.target.value)}
                className="bg-[#0B1121] border-gray-700 text-white"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={newWhitelistNumber}
                onChange={(e) => {
                  setNewWhitelistNumber(e.target.value);
                }}
                onInput={(e) => {
                  // Ensure input events work
                  const target = e.target as HTMLInputElement;
                  setNewWhitelistNumber(target.value);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onFocus={(e) => {
                  e.stopPropagation();
                }}
                className="bg-[#0B1121] border-gray-700 text-white"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newWhitelistName.trim()) {
                      handleAddWhitelist();
                    }
                  }
                }}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddWhitelistDialogOpen(false);
                setNewWhitelistName('');
                setNewWhitelistNumber('');
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#26d9bb] text-white hover:bg-[#20c4a8] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newWhitelistName.trim()}
            >
              Add to Whitelist
            </Button>
          </div>
        </form>
      </MobileModal>

      {/* View Whitelist Item Dialog */}
      <MobileModal
        open={isViewWhitelistDialogOpen}
        onOpenChange={(open) => {
          setIsViewWhitelistDialogOpen(open);
          if (!open) {
            setSelectedWhitelistItem(null);
            setEditingPhoneNumber('');
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateWhitelistNumber();
          }}
          className="space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Whitelist Details</h2>
            <p className="text-sm text-gray-400">
              View and edit details of this whitelist entry.
            </p>
          </div>
          {selectedWhitelistItem && (() => {
            // Get the latest item data from state to ensure we show current data
            const currentItem = whitelistItems.find(item => item.id === selectedWhitelistItem.id) || selectedWhitelistItem;
            return (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Name
                  </label>
                  <div className="text-base font-medium text-white bg-[#0B1121] border border-gray-700 rounded-md px-3 py-2">
                    {currentItem.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={editingPhoneNumber}
                    onChange={(e) => {
                      setEditingPhoneNumber(e.target.value);
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      setEditingPhoneNumber(target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="bg-[#0B1121] border-gray-700 text-white"
                    autoComplete="tel"
                  />
                </div>
              </div>
            );
          })()}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsViewWhitelistDialogOpen(false);
                setSelectedWhitelistItem(null);
                setEditingPhoneNumber('');
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpdateWhitelistNumber();
              }}
              className="bg-[#26d9bb] text-white hover:bg-[#20c4a8]"
            >
              Save
            </Button>
          </div>
        </form>
      </MobileModal>

      {/* Add Contact Dialog */}
      <MobileModal
        open={isAddContactDialogOpen}
        onOpenChange={setIsAddContactDialogOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (newContactName.trim() && newContactPhoneNumber.trim()) {
              handleAddContact();
            }
          }}
          className="space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Add New Contact</h2>
            <p className="text-sm text-gray-400">
              Add a contact to your list. Calls from these numbers will be protected.
            </p>
          </div>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g., John Doe"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="bg-[#0B1121] border-gray-700 text-white"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={newContactPhoneNumber}
                onChange={(e) => {
                  setNewContactPhoneNumber(e.target.value);
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  setNewContactPhoneNumber(target.value);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onFocus={(e) => {
                  e.stopPropagation();
                }}
                className="bg-[#0B1121] border-gray-700 text-white"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newContactName.trim() && newContactPhoneNumber.trim()) {
                      handleAddContact();
                    }
                  }
                }}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddContactDialogOpen(false);
                setNewContactName('');
                setNewContactPhoneNumber('');
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#26d9bb] text-white hover:bg-[#20c4a8] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newContactName.trim() || !newContactPhoneNumber.trim()}
            >
              Add Contact
            </Button>
          </div>
        </form>
      </MobileModal>
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
        Aegis AI Home
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Welcome to your Aegis AI dashboard. Here you can manage your call protection settings and monitor suspicious activity.
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

