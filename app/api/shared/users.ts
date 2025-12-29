// Shared user database - In production, this would be a real database
// For demo purposes, we'll use a simple in-memory store
// This is shared across login, register, and profile routes

export interface User {
  id: string;
  phoneNumber: string;
  password: string; // In production, this should be hashed
  name: string;
  profilePicture: string | null;
}

export let users: User[] = [
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

