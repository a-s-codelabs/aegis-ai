/**
 * Contact management utilities
 * Handles phone number normalization and contact list operations
 */

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

const CONTACTS_STORAGE_KEY = 'anti-scam-contacts';

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
