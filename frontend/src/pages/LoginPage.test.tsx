import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../features/auth/useAuth';
import { ThemeProvider } from '../features/theme/ThemeProvider';
import { LoginPage } from './LoginPage';

vi.mock('../features/auth/useAuth');

const login = vi.fn();
const NOTICE = 'Tu sesión expiró. Inicia sesión nuevamente.';

function CurrentUrl() {
  const { pathname, search } = useLocation();
  return <p data-testid="url">{pathname + search}</p>;
}

function renderPage(url = '/login') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<CurrentUrl />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({ login } as unknown as ReturnType<
      typeof useAuth
    >);
  });

  it('titula la pestaña', () => {
    renderPage();

    expect(document.title).toBe('Iniciar sesión · DPA Compliance Scanner');
  });

  it('no muestra el aviso de sesión expirada en un ingreso normal', () => {
    renderPage();

    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });

  it('muestra un aviso informativo cuando la sesión expiró', () => {
    renderPage('/login?sesion=expirada');

    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent(NOTICE);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('al iniciar sesión no deja el parámetro en la URL', async () => {
    const user = userEvent.setup();
    renderPage('/login?sesion=expirada');

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@ejemplo.cl',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(login).toHaveBeenCalledWith({
      email: 'ana@ejemplo.cl',
      password: 'secreta123',
    });
    expect(await screen.findByTestId('url')).toHaveTextContent(/^\/dashboard$/);
  });
});
