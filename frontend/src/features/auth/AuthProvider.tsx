import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { tokenStorage } from '../../lib/http/tokenStorage';
import { authService } from './authService';
import { AuthContext } from './authContext';
import type { AuthUser, LoginPayload, RegisterPayload } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => tokenStorage.get() !== null);

  useEffect(() => {
    if (!tokenStorage.get()) {
      return;
    }

    authService
      .getProfile()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    tokenStorage.set(response.accessToken);
    setUser(response.user);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    tokenStorage.set(response.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
