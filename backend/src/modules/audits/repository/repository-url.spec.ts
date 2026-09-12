import { InvalidRepositoryUrlError } from './repository.errors';
import { parseRepositoryUrl } from './repository-url';

describe('parseRepositoryUrl', () => {
  const hosts = ['github.com', 'gitlab.com'];
  const parse = (url: string) => parseRepositoryUrl(url, hosts);

  it('normaliza la URL quitando .git, barra final y mayúsculas del host', () => {
    expect(parse('  https://GitHub.com/OWASP/NodeGoat.git/ ')).toEqual({
      url: 'https://github.com/OWASP/NodeGoat',
      host: 'github.com',
      path: 'OWASP/NodeGoat',
    });
  });

  it('acepta subgrupos anidados de GitLab', () => {
    expect(parse('https://gitlab.com/grupo/subgrupo/proyecto').path).toBe(
      'grupo/subgrupo/proyecto',
    );
  });

  it.each([
    ['texto que no es URL', 'no-es-una-url', 'no es válida'],
    ['HTTP sin cifrar', 'http://github.com/org/repo', 'HTTPS'],
    ['protocolo de archivos', 'file:///etc/passwd', 'HTTPS'],
    ['protocolo SSH', 'ssh://git@github.com/org/repo', 'HTTPS'],
    [
      'credenciales en la URL',
      'https://user:clave@github.com/org/repo',
      'usuario',
    ],
    ['host no permitido', 'https://evil.example/org/repo', 'Solo se admiten'],
    [
      'red interna',
      'https://169.254.169.254/latest/meta-data',
      'Solo se admiten',
    ],
    ['puerto explícito', 'https://github.com:8443/org/repo', 'Solo se admiten'],
    ['parámetros', 'https://github.com/org/repo?ref=main', 'parámetros'],
    ['fragmento', 'https://github.com/org/repo#readme', 'parámetros'],
    ['sin repositorio', 'https://github.com/org', 'apuntar a un repositorio'],
    [
      'caracteres extraños',
      'https://github.com/org/re po',
      'apuntar a un repositorio',
    ],
  ])('rechaza %s', (_caso, url, mensaje) => {
    expect(() => parse(url)).toThrow(InvalidRepositoryUrlError);
    expect(() => parse(url)).toThrow(mensaje);
  });

  it('no permite recorrer directorios con segmentos de puntos', () => {
    expect(() => parse('https://github.com/org/%2E%2E')).toThrow(
      InvalidRepositoryUrlError,
    );
    expect(() => parse('https://github.com/../../etc')).toThrow(
      InvalidRepositoryUrlError,
    );
  });
});
