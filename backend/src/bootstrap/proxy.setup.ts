import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Indica cuántos proxies hay delante de la aplicación, para que la IP de cada
 * cliente se tome del encabezado `X-Forwarded-For`. De ella dependen los
 * límites de peticiones: sin esto, detrás del proxy de un hosting todos los
 * usuarios compartirían un mismo cupo.
 *
 * Con 0 no se confía en el encabezado, porque sin un proxy real cualquier
 * cliente podría falsificarlo para eludir los límites.
 * @param app Aplicación Nest sobre Express.
 * @param hops Cantidad de proxies de confianza.
 */
export function setupTrustedProxy(
  app: NestExpressApplication,
  hops: number,
): void {
  if (hops > 0) {
    app.set('trust proxy', hops);
  }
}
