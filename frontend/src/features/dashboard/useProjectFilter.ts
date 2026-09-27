import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AuditProject } from '../audits/types';

/** Parámetro de la URL con el id del proyecto elegido. */
export const PROJECT_PARAM = 'proyecto';

function withProject(params: URLSearchParams, projectId: string | null) {
  const next = new URLSearchParams(params);
  if (projectId === null) next.delete(PROJECT_PARAM);
  else next.set(PROJECT_PARAM, projectId);
  return next;
}

/**
 * Proyecto elegido en el filtro del panel, guardado en `?proyecto=<id>` para
 * que el botón Atrás y los enlaces conserven la selección. Cuando los datos
 * están listos (`isReady`) y el id no corresponde a ningún proyecto, vuelve a
 * "Todos" y limpia el parámetro sin agregar una entrada al historial.
 */
export function useProjectFilter(
  projects: readonly AuditProject[],
  isReady: boolean,
) {
  const [params, setParams] = useSearchParams();
  const requested = params.get(PROJECT_PARAM);
  const exists =
    requested !== null && projects.some((project) => project.id === requested);

  useEffect(() => {
    if (isReady && requested !== null && !exists) {
      setParams((current) => withProject(current, null), { replace: true });
    }
  }, [isReady, requested, exists, setParams]);

  const setProjectId = useCallback(
    (projectId: string | null) =>
      setParams((current) => withProject(current, projectId)),
    [setParams],
  );

  return { projectId: exists ? requested : null, setProjectId };
}
