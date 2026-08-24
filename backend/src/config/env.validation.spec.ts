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

  it('rechaza un puerto fuera de rango', () => {
    const { error } = envValidationSchema.validate({ ...baseEnv, PORT: 99999 });

    expect(error).toBeDefined();
  });
});
