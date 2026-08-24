import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  const check = jest.fn();

  beforeEach(async () => {
    check.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { check } }],
    }).compile();

    controller = module.get(HealthController);
  });

  it('delega la verificación en HealthService', async () => {
    const response = {
      status: 'ok' as const,
      database: true,
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
    check.mockResolvedValue(response);

    await expect(controller.check()).resolves.toEqual(response);
    expect(check).toHaveBeenCalledTimes(1);
  });
});
