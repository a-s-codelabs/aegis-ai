// Shared user database - Uses local JSON file for persistence
// This ensures users persist across server restarts

import { promises as fs } from 'fs';
import path from 'path';

export interface User {
  id: string;
  phoneNumber: string;
  password: string; // In production, this should be hashed
  name: string;
  profilePicture: string | null;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DB_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize default users
const defaultUsers: User[] = [
  {
    id: "1",
    phoneNumber: "+15551234567",
    password: "password123",
    name: "John Doe",
    profilePicture: null,
  },
  {
    id: "2",
    phoneNumber: "+15559876543",
    password: "password123",
    name: "Jane Smith",
    profilePicture: null,
  },
];

// Load users from file or return default
async function loadUsers(): Promise<User[]> {
  try {
    await ensureDataDirectory();
    const fileContent = await fs.readFile(DB_FILE_PATH, 'utf-8');
    const users = JSON.parse(fileContent);
    return Array.isArray(users) ? users : defaultUsers;
  } catch (error) {
    // File doesn't exist or is invalid, return defaults
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Initialize with default users
      await saveUsers(defaultUsers);
      return defaultUsers;
    }
    console.error('[Users DB] Error loading users:', error);
    return defaultUsers;
  }
}

// Save users to file
async function saveUsers(users: User[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Users DB] Error saving users:', error);
    throw error;
  }
}

// Normalize phone number for consistent comparison
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +1 (assuming US numbers)
  if (!normalized.startsWith('+')) {
    // Remove leading 1 if present
    if (normalized.startsWith('1') && normalized.length === 11) {
      normalized = '+' + normalized;
    } else {
      normalized = '+1' + normalized;
    }
  }
  
  return normalized;
}

// Get all users
export async function getUsers(): Promise<User[]> {
  return await loadUsers();
}

// Find user by phone number
export async function findUserByPhone(phoneNumber: string): Promise<User | null> {
  const users = await loadUsers();
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  return users.find((u) => {
    const userPhoneNormalized = normalizePhoneNumber(u.phoneNumber);
    return userPhoneNormalized === normalizedPhone;
  }) || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find((u) => u.id === id) || null;
}

// Add new user
export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  const users = await loadUsers();
  
  // Generate new ID
  const maxId = users.reduce((max, u) => {
    const idNum = parseInt(u.id, 10);
    return idNum > max ? idNum : max;
  }, 0);
  
  const newUser: User = {
    ...user,
    id: (maxId + 1).toString(),
    phoneNumber: normalizePhoneNumber(user.phoneNumber),
  };
  
  users.push(newUser);
  await saveUsers(users);
  
  return newUser;
}

// Update user
export async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User | null> {
  const users = await loadUsers();
  const userIndex = users.findIndex((u) => u.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  const updatedUser: User = {
    ...users[userIndex],
    ...updates,
    id: users[userIndex].id, // Ensure ID doesn't change
    phoneNumber: updates.phoneNumber 
      ? normalizePhoneNumber(updates.phoneNumber)
      : users[userIndex].phoneNumber,
  };
  
  users[userIndex] = updatedUser;
  await saveUsers(users);
  
  return updatedUser;
}

// For backward compatibility, export a getter that loads users
let cachedUsers: User[] | null = null;

export async function getUsersSync(): Promise<User[]> {
  if (!cachedUsers) {
    cachedUsers = await loadUsers();
  }
  return cachedUsers;
}

// Invalidate cache (call after mutations)
export function invalidateCache(): void {
  cachedUsers = null;
}
