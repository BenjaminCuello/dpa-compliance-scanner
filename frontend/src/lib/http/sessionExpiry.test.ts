import type { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSessionExpired, isSessionExpired } from './sessionExpiry';
import { tokenStorage } from './tokenStorage';

function buildError(status: number, url: string): AxiosError {
  return {
    response: { status } as AxiosError['response'],
    config: { url } as AxiosError['config'],
  } as AxiosError;
}

describe('isSessionExpired', () => {
  it('es falso cuando el error no es 401', () => {
    expect(isSessionExpired(buildError(500, '/audits'))).toBe(false);
  });

  it('es falso ante un 401 en el login (credenciales inválidas)', () => {
    expect(isSessionExpired(buildError(401, '/auth/login'))).toBe(false);
  });

  it('es falso ante un 401 en el registro', () => {
    expect(isSessionExpired(buildError(401, '/auth/register'))).toBe(false);
  });

  it('es verdadero ante un 401 en un endpoint protegido', () => {
    expect(isSessionExpired(buildError(401, '/audits'))).toBe(true);
  });
});

describe('handleSessionExpired', () => {
  beforeEach(() => tokenStorage.set('jwt'));

  function fakeLocation(pathname: string) {
    return { pathname, assign: vi.fn() };
  }

  it('borra el token y redirige a /login con el aviso de sesión expirada', () => {
    const location = fakeLocation('/auditorias');

    handleSessionExpired(buildError(401, '/audits'), location);

    expect(location.assign).toHaveBeenCalledWith('/login?sesion=expirada');
    expect(tokenStorage.get()).toBeNull();
  });

  it('no redirige ante un login fallido', () => {
    const location = fakeLocation('/login');

    handleSessionExpired(buildError(401, '/auth/login'), location);

    expect(location.assign).not.toHaveBeenCalled();
    expect(tokenStorage.get()).toBe('jwt');
  });

  it('no redirige si ya se está en /login', () => {
    const location = fakeLocation('/login');

    handleSessionExpired(buildError(401, '/auth/me'), location);

    expect(location.assign).not.toHaveBeenCalled();
  });

  it('no hace nada ante otros errores', () => {
    const location = fakeLocation('/dashboard');

    handleSessionExpired(buildError(500, '/audits'), location);

    expect(location.assign).not.toHaveBeenCalled();
    expect(tokenStorage.get()).toBe('jwt');
  });
});
