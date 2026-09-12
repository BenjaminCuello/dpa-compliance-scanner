import auditsConfig from './audits.config';

describe('auditsConfig', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('permite por omisión los principales servicios de repositorios', () => {
    process.env = { ...originalEnv };
    delete process.env.AUDIT_ALLOWED_GIT_HOSTS;

    expect(auditsConfig()).toMatchObject({
      allowedGitHosts: ['github.com', 'gitlab.com', 'bitbucket.org'],
      maxConcurrent: 2,
      maxRepositoryMb: 200,
    });
  });

  it('normaliza la lista de hosts recibida del entorno', () => {
    process.env = {
      ...originalEnv,
      AUDIT_ALLOWED_GIT_HOSTS: ' GitHub.com , ,git.empresa.cl ',
    };

    expect(auditsConfig().allowedGitHosts).toEqual([
      'github.com',
      'git.empresa.cl',
    ]);
  });
});
