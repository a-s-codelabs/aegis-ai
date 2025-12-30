/**
 * Contact management utilities
 * Handles phone number normalization and contact list operations
 */

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

const CONTACTS_STORAGE_KEY = 'aegis-ai-contacts';

/**
 * Normalizes a phone number to a standard format for comparison
 * Removes all non-digit characters except leading +
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If it starts with +, keep it; otherwise ensure consistent format
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If it's a US number without country code, add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it's 11 digits and starts with 1, add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Gets all contacts from localStorage
 */
export function getContacts(): Contact[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Contact[];
  } catch (error) {
    console.error(
      '[Contacts] Error reading contacts from localStorage:',
      error
    );
    return [];
  }
}

/**
 * Saves contacts to localStorage
 */
export function saveContacts(contacts: Contact[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('[Contacts] Error saving contacts to localStorage:', error);
  }
}

/**
 * Adds a new contact
 */
export function addContact(contact: Omit<Contact, 'id'>): Contact {
  const contacts = getContacts();
  const newContact: Contact = {
    ...contact,
    id: Date.now().toString(),
  };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
}

/**
 * Checks if a phone number exists in contacts
 * Returns the contact if found, null otherwise
 */
export function findContactByPhoneNumber(phoneNumber: string): Contact | null {
  const contacts = getContacts();
  const normalized = normalizePhoneNumber(phoneNumber);

  return (
    contacts.find((contact) => {
      const contactNormalized = normalizePhoneNumber(contact.phoneNumber);
      return contactNormalized === normalized;
    }) || null
  );
}

/**
 * Checks if a phone number is in the contact list
 */
export function isNumberInContacts(phoneNumber: string): boolean {
  return findContactByPhoneNumber(phoneNumber) !== null;
}

/**
 * Seeds dummy contacts if contacts list is empty
 * Only seeds if contact access is enabled
 */
export function seedDummyContacts(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if contact access is enabled
  const contactAccess = localStorage.getItem('contactAccessEnabled');
  const hasContactAccess = contactAccess === null || contactAccess === 'true';
  
  if (!hasContactAccess) {
    // Don't seed contacts if access is not enabled
    return;
  }

  const existingContacts = getContacts();
  if (existingContacts.length > 0) {
    // Contacts already exist, don't seed
    return;
  }

  // Generate random contacts for demo
  const randomNames = [
    'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis',
    'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez',
    'James Brown', 'Maria Garcia', 'William Jones', 'Patricia Williams',
    'Richard Miller', 'Linda Moore', 'Joseph Taylor', 'Barbara Jackson'
  ];

  // Generate random phone numbers
  const generateRandomPhone = () => {
    const area = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1${area}${exchange}${number}`;
  };

  // Select random contacts (8-12 contacts)
  const numContacts = Math.floor(Math.random() * 5) + 8;
  const selectedNames = [...randomNames].sort(() => Math.random() - 0.5).slice(0, numContacts);
  
  const dummyContacts: Contact[] = selectedNames.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    phoneNumber: generateRandomPhone(),
  }));

  saveContacts(dummyContacts);
  console.log('[Contacts] Seeded random dummy contacts:', dummyContacts.length);
}

/**
 * Seeds dummy blocklist entries if blocklist is empty or missing entries
 */
export function seedDummyBlocklist(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const BLOCKLIST_STORAGE_KEY = 'blocklist';
  
  try {
    const dummyBlocklist: string[] = [
      '+15557777777',
      '+15558888888',
      '+15559999999',
      '+15550000000',
      '+15551234560',
      '+15559876540',
    ];

    const existingBlocklist = localStorage.getItem(BLOCKLIST_STORAGE_KEY);
    let currentBlocklist: string[] = [];
    const wasEmpty = !existingBlocklist || existingBlocklist === '[]' || existingBlocklist.trim() === '';
    
    if (existingBlocklist) {
      try {
        const parsed = JSON.parse(existingBlocklist);
        if (Array.isArray(parsed)) {
          currentBlocklist = parsed;
        }
      } catch (parseError) {
        console.error('[Blocklist] Error parsing existing blocklist:', parseError);
      }
    }

    // Merge dummy entries with existing ones, avoiding duplicates
    const normalizedExisting = currentBlocklist.map(num => normalizePhoneNumber(num));
    
    // Add dummy entries that don't already exist
    let hasNewEntries = false;
    dummyBlocklist.forEach(dummyNum => {
      const normalizedDummyNum = normalizePhoneNumber(dummyNum);
      if (!normalizedExisting.includes(normalizedDummyNum)) {
        currentBlocklist.push(dummyNum);
        hasNewEntries = true;
      }
    });

    // Always update if we added new entries, or if blocklist was empty initially
    if (hasNewEntries || wasEmpty) {
      localStorage.setItem(BLOCKLIST_STORAGE_KEY, JSON.stringify(currentBlocklist));
      console.log('[Blocklist] Seeded dummy blocklist entries. Total entries:', currentBlocklist.length);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('blocklistUpdated'));
    }
  } catch (error) {
    console.error('[Blocklist] Error seeding dummy blocklist:', error);
  }
}

/**
 * Seeds dummy call logs if call logs are empty or missing entries
 */
export function seedDummyCallLogs(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const CALLS_STORAGE_KEY = 'calls';
  const CALL_LOGS_STORAGE_KEY = 'callLogs';
  
  try {
    // Create dummy call logs with varied data
    const now = new Date();
    const dummyCalls = [
      {
        id: '1',
        number: '+1 (184) 768-4419',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        duration: 0,
        status: 'scam' as const,
        risk: 95,
      },
      {
        id: '2',
        number: '+1 (724) 719-4042',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        duration: 252,
        status: 'safe' as const,
        risk: 5,
      },
      {
        id: '3',
        number: '+1 (202) 555-0199',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        duration: 0,
        status: 'unknown' as const,
      },
      {
        id: '4',
        number: '+1 (555) 123-4567',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        duration: 180,
        status: 'scam' as const,
        risk: 88,
      },
      {
        id: '5',
        number: '+1 (555) 987-6543',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        duration: 420,
        status: 'safe' as const,
        risk: 12,
      },
      {
        id: '6',
        number: '+1 (555) 456-7890',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        duration: 95,
        status: 'scam' as const,
        risk: 92,
      },
    ];

    // Check existing calls
    const existingCalls = localStorage.getItem(CALLS_STORAGE_KEY);
    let currentCalls: any[] = [];
    const wasEmpty = !existingCalls || existingCalls === '[]' || existingCalls.trim() === '';
    
    if (existingCalls) {
      try {
        const parsed = JSON.parse(existingCalls);
        if (Array.isArray(parsed)) {
          currentCalls = parsed;
        }
      } catch (parseError) {
        console.error('[CallLogs] Error parsing existing calls:', parseError);
      }
    }

    // Merge dummy calls with existing ones, avoiding duplicates by id
    const existingIds = new Set(currentCalls.map((call: any) => call.id));
    let hasNewEntries = false;
    
    dummyCalls.forEach((dummyCall) => {
      if (!existingIds.has(dummyCall.id)) {
        currentCalls.push(dummyCall);
        hasNewEntries = true;
      }
    });

    // Only update if we added new entries or if calls was empty
    if (hasNewEntries || wasEmpty) {
      localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(currentCalls));
      console.log('[CallLogs] Seeded dummy calls. Total entries:', currentCalls.length);
    }

    // Also seed callLogs (used by call logs page)
    const existingCallLogs = localStorage.getItem(CALL_LOGS_STORAGE_KEY);
    let currentCallLogs: any[] = [];
    const callLogsWasEmpty = !existingCallLogs || existingCallLogs === '[]' || existingCallLogs.trim() === '';
    
    if (existingCallLogs) {
      try {
        const parsed = JSON.parse(existingCallLogs);
        if (Array.isArray(parsed)) {
          currentCallLogs = parsed;
        }
      } catch (parseError) {
        console.error('[CallLogs] Error parsing existing callLogs:', parseError);
      }
    }

    // Create call log entries from dummy calls
    const dummyCallLogs = dummyCalls.map((call) => ({
      ...call,
      transcript: [],
      keywords: call.status === 'scam' ? ['SUSPICIOUS', 'URGENT'] : [],
    }));

    const existingCallLogIds = new Set(currentCallLogs.map((log: any) => log.id));
    let hasNewCallLogEntries = false;
    
    dummyCallLogs.forEach((dummyLog) => {
      if (!existingCallLogIds.has(dummyLog.id)) {
        currentCallLogs.push(dummyLog);
        hasNewCallLogEntries = true;
      }
    });

    // Only update if we added new entries or if callLogs was empty
    if (hasNewCallLogEntries || callLogsWasEmpty) {
      localStorage.setItem(CALL_LOGS_STORAGE_KEY, JSON.stringify(currentCallLogs));
      console.log('[CallLogs] Seeded dummy callLogs. Total entries:', currentCallLogs.length);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('callLogsUpdated'));
    }
  } catch (error) {
    console.error('[CallLogs] Error seeding dummy call logs:', error);
  }
}