import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import { ThrottlerStorage } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap/app.setup';
import { RepositoryFetcherService } from '../../src/modules/audits/repository/repository-fetcher.service';
import { SemgrepRunnerService } from '../../src/modules/scanner/semgrep/semgrep-runner.service';
import { FakeRepositoryFetcher } from './repository.fake';
import { FakeSemgrepRunner } from './semgrep.fake';

/** Aplicación levantada para las pruebas, con sus dobles a mano. */
export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
  semgrep: FakeSemgrepRunner;
  repository: FakeRepositoryFetcher;
  /** Prefijo de las rutas, para construir las URLs igual que en producción. */
  prefix: string;
}

/** Almacenamiento que nunca bloquea: desactiva el límite de peticiones. */
const unlimitedStorage: ThrottlerStorage = {
  increment: () =>
    Promise.resolve({
      totalHits: 1,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    }),
};

/**
 * Levanta la aplicación completa contra la base de datos de pruebas.
 *
 * Solo se reemplazan las dos dependencias externas al proyecto: el clonado con
 * git y la ejecución de Semgrep. Todo lo demás —guards, validaciones, TypeORM
 * y PostgreSQL— es el mismo código que corre en producción.
 *
 * El límite de peticiones se desactiva salvo que se pida con `withRateLimit`,
 * porque las pruebas hacen muchas llamadas seguidas.
 */
export async function createTestApp(
  options: { withRateLimit?: boolean } = {},
): Promise<TestContext> {
  const semgrep = new FakeSemgrepRunner();
  const repository = new FakeRepositoryFetcher(
    process.env.SCANNER_WORKSPACE_DIR as string,
  );

  const builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(SemgrepRunnerService)
    .useValue(semgrep)
    .overrideProvider(RepositoryFetcherService)
    .useValue(repository);

  if (!options.withRateLimit) {
    builder.overrideProvider(ThrottlerStorage).useValue(unlimitedStorage);
  }

  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({
    logger: false,
  });
  const prefix = configureApp(app);
  await app.init();

  return { app, dataSource: app.get(DataSource), semgrep, repository, prefix };
}

/** Cliente HTTP apuntado a la aplicación de pruebas. */
export function api(context: TestContext): request.Agent {
  return request(context.app.getHttpServer() as Server);
}

/** Construye una ruta con el prefijo global de la API. */
export function path(context: TestContext, route: string): string {
  return `/${context.prefix}${route}`;
}

/** Deja la base de datos vacía entre pruebas. */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    'TRUNCATE TABLE check_results, audits, projects, users RESTART IDENTITY CASCADE',
  );
}

/**
 * Espera a que la auditoría deje de estar en curso. El escaneo ocurre en
 * segundo plano, así que las pruebas consultan hasta ver el estado final.
 */
export async function waitForAudit(
  context: TestContext,
  auditId: string,
  token: string,
): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const { body } = await api(context)
      .get(path(context, `/audits/${auditId}`))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    if (body.status === 'completed' || body.status === 'failed') {
      return body as Record<string, unknown>;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('La auditoría no terminó dentro del tiempo esperado');
}
