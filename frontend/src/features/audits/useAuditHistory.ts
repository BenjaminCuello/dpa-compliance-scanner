import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '../../lib/http/apiError';
import { auditsService } from './auditsService';
import type { AuditList, ListAuditsParams } from './types';

interface HistoryState {
  /** Petición a la que corresponde este estado. */
  key: string;
  data: AuditList | null;
  error: string | null;
}

/**
 * Historial paginado y filtrado de auditorías. Vuelve a cargar cuando cambia
 * algún parámetro o al llamar a `reload`, e ignora respuestas de peticiones
 * anteriores que lleguen tarde. Mientras recarga conserva la página previa.
 */
export function useAuditHistory(params: ListAuditsParams = {}) {
  const { projectId, status, page, limit } = params;
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<HistoryState>({
    key: '',
    data: null,
    error: null,
  });
  const key = JSON.stringify([projectId, status, page, limit, reloadToken]);

  useEffect(() => {
    let cancelled = false;

    auditsService.list({ projectId, status, page, limit }).then(
      (data) => {
        if (!cancelled) setState({ key, data, error: null });
      },
      (error: unknown) => {
        if (cancelled) return;
        setState((previous) => ({
          key,
          data: previous.data,
          error: extractErrorMessage(error),
        }));
      },
    );

    return () => {
      cancelled = true;
    };
  }, [key, projectId, status, page, limit]);

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);

  return {
    data: state.data,
    error: state.key === key ? state.error : null,
    isLoading: state.key !== key,
    reload,
  };
}
