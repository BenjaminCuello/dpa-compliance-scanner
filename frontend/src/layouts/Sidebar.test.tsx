import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../features/auth/useAuth';
import { ThemeProvider } from '../features/theme/ThemeProvider';
import { Sidebar } from './Sidebar';

vi.mock('../features/auth/useAuth');

const logout = vi.fn();

function renderSidebar() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<p>Página de login</p>} />
          <Route path="*" element={<Sidebar />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    logout.mockReset();
    vi.mocked(useAuth).mockReturnValue({
      user: { name: 'Ana' },
      logout,
    } as unknown as ReturnType<typeof useAuth>);
  });

  it('los enlaces se identifican por su nombre también en la versión compacta', () => {
    renderSidebar();

    for (const name of ['Panel', 'Auditorías']) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('title', name);
    }
  });

  it('el nombre del usuario se oculta bajo md', () => {
    renderSidebar();

    expect(screen.getByText('Ana')).toHaveClass('hidden', 'md:inline');
  });

  it('el tema y el cierre de sesión son botones con nombre accesible', async () => {
    const user = userEvent.setup();
    renderSidebar();

    expect(
      screen.getByRole('button', { name: 'Activar modo oscuro' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(logout).toHaveBeenCalled();
    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });
});
