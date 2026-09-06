import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from '../features/auth/useAuth';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../features/auth/useAuth');

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<p>Página de login</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Panel privado</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('muestra un estado de carga mientras se valida la sesión', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('redirige a /login cuando no hay sesión autenticada', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('muestra la ruta privada cuando hay sesión autenticada', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText('Panel privado')).toBeInTheDocument();
  });
});
