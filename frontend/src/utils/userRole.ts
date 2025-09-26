// frontend/src/utils/userRole.ts

// Define all possible roles
export type UserRole = 'admin' | 'board' | 'member' | 'guest';

/**
 * Map a user ID to a role.
 * In a real app, this should probably come from your backend or user context.
 * For now, we'll hardcode some simple logic.
 */
export function getUserRole(userId?: string): UserRole {
  if (!userId) return 'guest';

  // Example mapping logic (replace with real one)
  if (userId.startsWith('admin')) return 'admin';
  if (userId.startsWith('board')) return 'board';
  if (userId.startsWith('user')) return 'member';

  return 'guest';
}

/**
 * Determines if the given role can access board-restricted documents.
 */
export function canAccessBoardRestricted(role: UserRole): boolean {
  return role === 'admin' || role === 'board';
}
