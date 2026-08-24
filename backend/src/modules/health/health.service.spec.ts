import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  const query = jest.fn();

  beforeEach(async () => {
    query.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getDataSourceToken(),
          useValue: { query } as Partial<DataSource>,
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('reporta estado "ok" cuando la base de datos responde', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.check();

    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(result.status).toBe('ok');
    expect(result.database).toBe(true);
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('reporta estado "degraded" cuando la base de datos falla', async () => {
    query.mockRejectedValue(new Error('conexión rechazada'));

    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.database).toBe(false);
  });
});
