import { describe, expect, it } from 'vitest';
import { extractErrorMessage } from './apiError';

function buildError(message: unknown) {
  return { response: { data: { message } } };
}

describe('extractErrorMessage', () => {
  it('devuelve el mensaje cuando es un string simple', () => {
    expect(extractErrorMessage(buildError('Credenciales inválidas'))).toBe(
      'Credenciales inválidas',
    );
  });

  it('devuelve el primer mensaje cuando es un arreglo', () => {
    const error = buildError(['El correo no tiene un formato válido']);

    expect(extractErrorMessage(error)).toBe(
      'El correo no tiene un formato válido',
    );
  });

  it('desanida el mensaje cuando viene envuelto por el ValidationPipe', () => {
    const error = buildError({
      statusCode: 400,
      message: ['La contraseña es obligatoria'],
      error: 'Bad Request',
    });

    expect(extractErrorMessage(error)).toBe('La contraseña es obligatoria');
  });

  it('devuelve el mensaje por defecto cuando no hay información', () => {
    expect(extractErrorMessage({}, 'Error genérico')).toBe('Error genérico');
  });
});
