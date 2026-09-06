import { beforeEach, describe, expect, it } from 'vitest';
import { tokenStorage } from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('devuelve null cuando no hay token guardado', () => {
    expect(tokenStorage.get()).toBeNull();
  });

  it('guarda y recupera el token', () => {
    tokenStorage.set('token-de-prueba');

    expect(tokenStorage.get()).toBe('token-de-prueba');
  });

  it('elimina el token guardado', () => {
    tokenStorage.set('token-de-prueba');
    tokenStorage.clear();

    expect(tokenStorage.get()).toBeNull();
  });
});
