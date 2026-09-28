import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { buildSwaggerConfig } from '../../bootstrap/swagger.setup';
import { AuditsController } from '../../modules/audits/audits.controller';
import { AuditsService } from '../../modules/audits/audits.service';
import { AuthController } from '../../modules/auth/auth.controller';
import { AuthService } from '../../modules/auth/auth.service';
import { HealthController } from '../../modules/health/health.controller';
import { HealthService } from '../../modules/health/health.service';

type Method = 'get' | 'post';

/** Códigos de respuesta que debe declarar cada operación documentada. */
const OPERATIONS: [Method, string, string[]][] = [
  ['post', '/api/auth/register', ['201', '400', '409', '429']],
  ['post', '/api/auth/login', ['200', '400', '401', '429']],
  ['get', '/api/auth/profile', ['200', '401', '429']],
  ['post', '/api/audits', ['202', '400', '401', '404', '409', '429']],
  ['get', '/api/audits', ['200', '400', '401', '429']],
  ['get', '/api/audits/{id}', ['200', '400', '401', '404', '429']],
  ['get', '/api/health', ['200', '429']],
];

const ERROR_SCHEMA_REF = '#/components/schemas/ErrorResponseDto';

/** Parte de una respuesta documentada que revisan estas pruebas. */
interface DocumentedResponse {
  description?: string;
  content?: Record<string, { schema?: unknown; example?: unknown }>;
}

describe('documento OpenAPI', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  const operation = (method: Method, route: string) =>
    document.paths[route][method]!;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, AuditsController, HealthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: AuditsService, useValue: {} },
        { provide: HealthService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  });

  afterAll(() => app.close());

  it('usa la versión 1.0.0 y la autenticación bearer', () => {
    expect(document.info.version).toBe('1.0.0');
    expect(document.components?.securitySchemes?.bearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });

  it.each(OPERATIONS)(
    '%s %s declara exactamente sus códigos de respuesta',
    (method, route, codes) => {
      expect(Object.keys(operation(method, route).responses).sort()).toEqual(
        codes,
      );
    },
  );

  it.each(OPERATIONS)(
    '%s %s documenta sus errores con ErrorResponseDto y un ejemplo',
    (method, route, codes) => {
      const responses = operation(method, route).responses;

      for (const code of codes.filter((status) => Number(status) >= 400)) {
        const response = responses[code] as DocumentedResponse;
        const content = response.content?.['application/json'];

        expect(content?.schema).toEqual({ $ref: ERROR_SCHEMA_REF });
        expect(content?.example).toMatchObject({ statusCode: Number(code) });
        expect(response.description).toBeTruthy();
      }
    },
  );

  it('publica el esquema ErrorResponseDto con message variable', () => {
    const schema = document.components?.schemas?.ErrorResponseDto as {
      required: string[];
      properties: Record<string, { oneOf?: unknown[] }>;
    };

    expect(schema.required).toEqual(
      expect.arrayContaining(['statusCode', 'path', 'timestamp', 'message']),
    );
    expect(schema.properties.message.oneOf).toHaveLength(3);
  });

  it('declara la paginación de GET /audits como enteros', () => {
    const parameters = operation('get', '/api/audits').parameters ?? [];

    for (const name of ['page', 'limit']) {
      expect(parameters).toContainEqual(
        expect.objectContaining({
          name,
          in: 'query',
          schema: expect.objectContaining({ type: 'integer' }) as unknown,
        }),
      );
    }
  });

  it('declara el id de GET /audits/{id} como UUID en la ruta', () => {
    const parameters = operation('get', '/api/audits/{id}').parameters ?? [];

    expect(parameters).toContainEqual(
      expect.objectContaining({
        name: 'id',
        in: 'path',
        required: true,
        schema: expect.objectContaining({ format: 'uuid' }) as unknown,
      }),
    );
  });
});
