import { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_USERS, ADMIN_USER_IDS } from '@/mock/data';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  user_type: 'cliente' | 'produtor';
  avatar_url: string | null;
}

interface MockUser {
  id: string;
  email: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

interface AuthContextType {
  session: MockSession | null;
  user: MockUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta: { name: string; user_type: string; phone?: string; cpf?: string }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: false,
  isAdmin: false,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore from localStorage
  const storedUserId = localStorage.getItem('mock_user_id');
  const storedUser = storedUserId ? MOCK_USERS[storedUserId] : null;

  const [userId, setUserId] = useState<string | null>(storedUserId);
  const [profile, setProfile] = useState<Profile | null>(storedUser?.profile as Profile || null);

  const user: MockUser | null = userId && MOCK_USERS[userId]
    ? { id: userId, email: MOCK_USERS[userId].email }
    : null;

  const session: MockSession | null = user
    ? { user, access_token: 'mock-token' }
    : null;

  const isAdmin = userId ? ADMIN_USER_IDS.includes(userId) : false;

  const signIn = async (email: string, password: string) => {
    const entry = Object.entries(MOCK_USERS).find(
      ([, u]) => u.email === email && u.password === password
    );
    if (!entry) return { error: 'Email ou senha incorretos' };
    const [id, userData] = entry;
    localStorage.setItem('mock_user_id', id);
    setUserId(id);
    setProfile(userData.profile as Profile);
    return { error: null };
  };

  const signUp = async (email: string, password: string, meta: { name: string; user_type: string; phone?: string; cpf?: string }) => {
    // Check if email already exists
    const exists = Object.values(MOCK_USERS).find(u => u.email === email);
    if (exists) return { error: 'Email já cadastrado' };

    const newId = `user-${Date.now()}`;
    MOCK_USERS[newId] = {
      email,
      password,
      profile: {
        id: `prof-${Date.now()}`,
        user_id: newId,
        name: meta.name,
        email,
        phone: meta.phone || '',
        cpf: meta.cpf || null,
        user_type: meta.user_type as 'cliente' | 'produtor',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('mock_user_id');
    setUserId(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading: false, isAdmin, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}
