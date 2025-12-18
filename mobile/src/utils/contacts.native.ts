/**
 * Native contact utilities for React Native
 * Uses react-native-contacts for device contact access
 */

import Contacts from 'react-native-contacts';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

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
 * Gets all contacts from device
 * Requires READ_CONTACTS permission
 */
export async function getContacts(): Promise<Contact[]> {
  try {
    const contacts = await Contacts.getAll();

    return contacts
      .flatMap(contact => {
        // Extract all phone numbers from contact
        return (contact.phoneNumbers || []).map(phone => ({
          id: `${contact.recordID}-${phone.id}`,
          name: `${contact.givenName || ''} ${contact.familyName || ''}`.trim() || 'Unknown',
          phoneNumber: normalizePhoneNumber(phone.number),
        }));
      })
      .filter(contact => contact.phoneNumber.length > 0);
  } catch (error) {
    console.error('[Contacts] Error reading contacts:', error);
    return [];
  }
}

/**
 * Checks if a phone number exists in device contacts
 * Returns the contact if found, null otherwise
 */
export async function findContactByPhoneNumber(
  phoneNumber: string
): Promise<Contact | null> {
  try {
    const contacts = await getContacts();
    const normalized = normalizePhoneNumber(phoneNumber);

    return (
      contacts.find(contact => {
        const contactNormalized = normalizePhoneNumber(contact.phoneNumber);
        return contactNormalized === normalized;
      }) || null
    );
  } catch (error) {
    console.error('[Contacts] Error finding contact:', error);
    return null;
  }
}

/**
 * Checks if a phone number is in the contact list
 */
export async function isNumberInContacts(phoneNumber: string): Promise<boolean> {
  const contact = await findContactByPhoneNumber(phoneNumber);
  return contact !== null;
}

