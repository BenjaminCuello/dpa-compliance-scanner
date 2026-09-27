import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '../../lib/http/apiError';
import { loadDashboardData } from './loadDashboardData';
import type { DashboardData } from './types';

interface DashboardState {
  /** Petición a la que corresponde este estado. */
  key: number;
  data: DashboardData | null;
  error: string | null;
}

/**
 * Datos del panel de cumplimiento. Al llamar a `reload` conserva los datos
 * anteriores mientras llegan los nuevos, e ignora respuestas de cargas
 * anteriores que lleguen tarde. `error` solo refleja fallas del listado.
 */
export function useDashboardData() {
  const [key, setKey] = useState(0);
  const [state, setState] = useState<DashboardState>({
    key: -1,
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    loadDashboardData().then(
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
  }, [key]);

  const reload = useCallback(() => setKey((value) => value + 1), []);

  return {
    summaries: state.data?.summaries ?? [],
    latestDetails: state.data?.latestDetails ?? [],
    isTruncated: state.data?.isTruncated ?? false,
    isLoading: state.key !== key,
    error: state.key === key ? state.error : null,
    reload,
  };
}
