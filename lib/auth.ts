import { AuthUser, LoginCredentials, UserRole } from '@/types';

// Mock users data - ready for Supabase integration later
export const mockUsers: AuthUser[] = [
  {
    id: 'user-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    created_at: '2024-01-01'
  },
  {
    id: 'user-2',
    email: 'store1@test.com',
    name: 'Downtown Store Manager',
    role: 'store',
    store_id: 's1', // matches our mock store s1 (Downtown Branch)
    created_at: '2024-01-02'
  },
  {
    id: 'user-3',
    email: 'store2@test.com',
    name: 'Westside Store Manager',
    role: 'store',
    store_id: 's2', // matches our mock store s2 (Westside Branch)
    created_at: '2024-01-03'
  }
];

// Mock password lookup (in real app, never store plain text!)
const mockPasswords: Record<string, string> = {
  'admin@test.com': 'admin123',
  'store1@test.com': 'store123',
  'store2@test.com': 'store123'
};

// Local storage key for mock auth
const AUTH_STORAGE_KEY = 'restaurant_auth_user';

/**
 * Mock login function - simulates API call
 * @param credentials Email and password
 * @returns User object or error
 */
export async function mockLogin(
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find user by email
  const user = mockUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Check password
  const storedPassword = mockPasswords[credentials.email.toLowerCase()];
  if (storedPassword !== credentials.password) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Return user on success
  return { success: true, user };
}

/**
 * Mock logout function
 */
export async function mockLogout(): Promise<void> {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Get current user from local storage
 */
export function getStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored user', e);
  }
  return null;
}

/**
 * Save user to local storage
 */
export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Get redirect path based on user role
 */
export function getHomePathForRole(role: UserRole): string {
  return role === 'admin' ? '/dashboard' : '/store-dashboard';
}

/**
 * Permission check helpers
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

export function isStoreUser(user: AuthUser | null): boolean {
  return user?.role === 'store';
}

export function canAccessAdminPages(user: AuthUser | null): boolean {
  return isAdmin(user);
}

export function canAccessStorePage(user: AuthUser | null, storeId: string): boolean {
  if (isAdmin(user)) return true;
  if (isStoreUser(user) && user) return user.store_id === storeId;
  return false;
}