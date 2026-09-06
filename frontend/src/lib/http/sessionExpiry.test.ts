import type { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { isSessionExpired } from './sessionExpiry';

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
