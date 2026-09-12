import {
  InvalidScanTargetError,
  ScanFailedError,
  ScannerUnavailableError,
} from '../../scanner/errors/scanner.errors';
import { RepositoryFetchError } from '../repository/repository.errors';
import { toPublicFailureMessage } from './audit-failure';

describe('toPublicFailureMessage', () => {
  it('conserva los mensajes redactados para el usuario', () => {
    expect(
      toPublicFailureMessage(new RepositoryFetchError('No se pudo descargar')),
    ).toBe('No se pudo descargar');
    expect(toPublicFailureMessage(new ScanFailedError('Tiempo agotado'))).toBe(
      'Tiempo agotado',
    );
  });

  it('usa mensajes propios para los errores del motor', () => {
    expect(toPublicFailureMessage(new ScannerUnavailableError())).toContain(
      'no está disponible',
    );
    expect(
      toPublicFailureMessage(new InvalidScanTargetError('/tmp/dpa-scanner/x')),
    ).not.toContain('/tmp');
  });

  it('oculta el detalle de cualquier otro error', () => {
    const message = toPublicFailureMessage(
      new Error(
        'connect ECONNREFUSED 10.0.0.5:5432 password authentication failed',
      ),
    );

    expect(message).toBe('La auditoría falló por un error inesperado');
  });
});
