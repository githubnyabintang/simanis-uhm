import type { User } from '../types';

export function findLoginUser(users: User[], identifier: string): { user?: User; ambiguous: boolean } {
  const key = identifier.trim().toLowerCase();
  if (!key) return { ambiguous: false };
  const direct = users.filter((user) => user.username?.trim().toLowerCase() === key || user.email?.trim().toLowerCase() === key);
  if (direct.length === 1) return { user: direct[0], ambiguous: false };
  if (direct.length > 1) return { ambiguous: true };
  const secondary = users.filter((user) => user.npm?.trim().toLowerCase() === key || user.nidn?.trim().toLowerCase() === key);
  return secondary.length === 1 ? { user: secondary[0], ambiguous: false } : { ambiguous: secondary.length > 1 };
}
