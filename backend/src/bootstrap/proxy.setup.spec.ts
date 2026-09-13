import { NestExpressApplication } from '@nestjs/platform-express';
import { setupTrustedProxy } from './proxy.setup';

describe('setupTrustedProxy', () => {
  const appWith = () => {
    const set = jest.fn();
    return { app: { set } as unknown as NestExpressApplication, set };
  };

  it('no confía en X-Forwarded-For si no hay proxies declarados', () => {
    const { app, set } = appWith();

    setupTrustedProxy(app, 0);

    expect(set).not.toHaveBeenCalled();
  });

  it('confía solo en la cantidad de proxies indicada', () => {
    const { app, set } = appWith();

    setupTrustedProxy(app, 1);

    expect(set).toHaveBeenCalledWith('trust proxy', 1);
  });
});
