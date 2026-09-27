import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '../../lib/http/apiError';
import { auditsService } from './auditsService';
import type { AuditDetail, AuditStatus } from './types';

/** Tiempo entre consultas mientras la auditoría sigue en curso. */
export const POLL_INTERVAL_MS = 3000;

const ACTIVE_STATUSES: readonly AuditStatus[] = ['pending', 'running'];

interface PollingState {
  /** Petición a la que corresponde este estado (`id:intento`). */
  key: string;
  audit: AuditDetail | null;
  error: string | null;
  notFound: boolean;
}

const EMPTY_STATE: PollingState = {
  key: '',
  audit: null,
  error: null,
  notFound: false,
};

/** El backend responde 404 si no existe o es ajena, y 400 si el id no es UUID. */
function isNotFound(error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status === 404 || status === 400;
}

/**
 * Carga el detalle de una auditoría y lo vuelve a consultar cada
 * `POLL_INTERVAL_MS` mientras esté en `pending` o `running`. Se detiene al
 * terminar, ante un error, al cambiar el `id` y al desmontar. `retry`
 * descarta el error y reanuda la consulta desde cero.
 */
export function useAuditPolling(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PollingState>(EMPTY_STATE);
  const key = `${id}:${attempt}`;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      try {
        const audit = await auditsService.getById(id);
        if (cancelled) return;

        setState({ key, audit, error: null, notFound: false });
        if (ACTIVE_STATUSES.includes(audit.status)) {
          timer = setTimeout(() => void load(), POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) return;

        setState((previous) => ({
          key,
          audit: previous.key === key ? previous.audit : null,
          error: extractErrorMessage(error),
          notFound: isNotFound(error),
        }));
      }
    }

    void load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, key]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const current = state.key === key ? state : EMPTY_STATE;

  return {
    audit: current.audit,
    error: current.error,
    isLoading: state.key !== key,
    notFound: current.notFound,
    retry,
  };
}
