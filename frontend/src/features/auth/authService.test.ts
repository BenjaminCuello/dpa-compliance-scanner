import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../lib/http/httpClient';
import { authService } from './authService';

vi.mock('../../lib/http/httpClient', () => ({
  httpClient: { post: vi.fn(), get: vi.fn() },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.mocked(httpClient.post).mockReset();
    vi.mocked(httpClient.get).mockReset();
  });

  it('envía email y contraseña a /auth/login', async () => {
    const response = { accessToken: 'jwt', user: { id: '1' } };
    vi.mocked(httpClient.post).mockResolvedValue({ data: response });

    const result = await authService.login({
      email: 'ana@ejemplo.cl',
      password: 'Clave.Segura2026',
    });

    expect(httpClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@ejemplo.cl',
      password: 'Clave.Segura2026',
    });
    expect(result).toEqual(response);
  });

  it('envía email, nombre y contraseña a /auth/register', async () => {
    const payload = {
      email: 'ana@ejemplo.cl',
      name: 'Ana Pérez',
      password: 'Clave.Segura2026',
    };
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { accessToken: 'jwt', user: {} },
    });

    await authService.register(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/auth/register', payload);
  });

  it('consulta el perfil en /auth/profile', async () => {
    const user = { id: '1', email: 'ana@ejemplo.cl', name: 'Ana Pérez' };
    vi.mocked(httpClient.get).mockResolvedValue({ data: user });

    const result = await authService.getProfile();

    expect(httpClient.get).toHaveBeenCalledWith('/auth/profile');
    expect(result).toEqual(user);
  });
});
