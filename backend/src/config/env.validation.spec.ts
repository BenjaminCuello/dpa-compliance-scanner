import { envValidationSchema } from './env.validation';

interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: string;
  API_PREFIX: string;
}

describe('envValidationSchema', () => {
  const baseEnv = {
    DB_HOST: 'localhost',
    DB_USERNAME: 'scanner',
    DB_PASSWORD: 'secreto',
    DB_NAME: 'dpa_scanner',
    JWT_SECRET: 'clave_de_pruebas_con_mas_de_32_caracteres',
  };

  it('aplica valores por defecto cuando faltan variables opcionales', () => {
    const { error, value } = envValidationSchema.validate(baseEnv) as {
      error?: Error;
      value: EnvironmentVariables;
    };

    expect(error).toBeUndefined();
    expect(value.PORT).toBe(3000);
    expect(value.NODE_ENV).toBe('development');
    expect(value.API_PREFIX).toBe('api');
  });

  it('rechaza la configuración si falta una variable obligatoria', () => {
    const { error } = envValidationSchema.validate(
      { ...baseEnv, DB_HOST: undefined },
      { abortEarly: false },
    );

    expect(error?.message).toContain('DB_HOST');
  });

  it('exige una clave de firma suficientemente larga', () => {
    const { error } = envValidationSchema.validate({
      ...baseEnv,
      JWT_SECRET: 'demasiado-corta',
    });

    expect(error?.message).toContain('JWT_SECRET');
  });

  it('rechaza la configuración si falta la clave de firma', () => {
    const { error } = envValidationSchema.validate({
      ...baseEnv,
      JWT_SECRET: undefined,
    });

    expect(error?.message).toContain('JWT_SECRET');
  });

  it('aplica los valores por defecto del escáner', () => {
    const { value } = envValidationSchema.validate(baseEnv) as {
      value: Record<string, unknown>;
    };

    expect(value.SEMGREP_BIN).toBe('semgrep');
    expect(value.SEMGREP_TIMEOUT_MS).toBe(300000);
  });

  it('rechaza un tiempo máximo de escaneo demasiado bajo', () => {
    const { error } = envValidationSchema.validate({
      ...baseEnv,
      SEMGREP_TIMEOUT_MS: 10,
    });

    expect(error?.message).toContain('SEMGREP_TIMEOUT_MS');
  });

  it('rechaza un puerto fuera de rango', () => {
    const { error } = envValidationSchema.validate({ ...baseEnv, PORT: 99999 });

    expect(error).toBeDefined();
  });
});
