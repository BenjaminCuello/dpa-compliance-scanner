import { useContext } from 'react';
import { ThemeContext } from './themeContext';

/** Da acceso al modo de color actual y permite alternarlo. */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de un <ThemeProvider>');
  }

  return context;
}
