import { User } from '@/types/models';
import { getItems, setItems, generateId, now } from './storage';

const KEY = 'ticketapp_users';

function ensureDefaults(): void {
  const users = getItems<User>(KEY);
  if (users.length === 0) {
    const defaultUser: User = {
      id: 'user-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      created_at: now(),
      updated_at: now(),
    };
    setItems(KEY, [defaultUser]);
  }
}

export function getUsers(): User[] {
  ensureDefaults();
  return getItems<User>(KEY);
}

export function getCurrentUser(): User {
  ensureDefaults();
  return getItems<User>(KEY)[0];
}

export function createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
  const users = getUsers();
  const user: User = { ...data, id: generateId(), created_at: now(), updated_at: now() };
  setItems(KEY, [...users, user]);
  return user;
}
