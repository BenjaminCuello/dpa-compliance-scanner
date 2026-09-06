import { useContext } from 'react';
import { AuthContext } from './authContext';

/** Da acceso al estado y las acciones de autenticación. */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }

  return context;
}
