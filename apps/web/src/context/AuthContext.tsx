import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { LoginInput, RegisterInput, UserDto } from '@zenith/shared';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/tokenStorage';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tokenStorage.getAccessToken()) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(input: LoginInput) {
    const tokens = await authApi.login(input);
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(await authApi.me());
  }

  async function register(input: RegisterInput) {
    const tokens = await authApi.register(input);
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(await authApi.me());
  }

  async function logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
    tokenStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
