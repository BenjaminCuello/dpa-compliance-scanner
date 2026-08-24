import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/api/health', method: 'GET' }),
    }),
  } as unknown as ArgumentsHost;

  let filter: HttpExceptionFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new HttpExceptionFilter();
  });

  it('conserva el código de estado de una HttpException', () => {
    filter.catch(
      new HttpException('No encontrado', HttpStatus.NOT_FOUND),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, path: '/api/health' }),
    );
  });

  it('oculta el detalle de errores no controlados', () => {
    jest.spyOn(filter['logger'], 'error').mockImplementation();

    filter.catch(new Error('credenciales de la base de datos inválidas'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error interno del servidor' }),
    );
  });
});
