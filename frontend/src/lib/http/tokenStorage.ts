const TOKEN_KEY = 'dpa_scanner_access_token';

/** Persiste el token JWT en el almacenamiento local del navegador. */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
