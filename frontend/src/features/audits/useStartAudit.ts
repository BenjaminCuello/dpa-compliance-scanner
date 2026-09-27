import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../../lib/http/apiError';
import { auditsService } from './auditsService';
import type { StartAuditPayload } from './types';

/**
 * Inicia una auditoría y, si el backend la acepta, navega a su detalle
 * (`/auditorias/:id`). Si falla, deja el mensaje legible en `error`.
 */
export function useStartAudit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (payload: StartAuditPayload) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const audit = await auditsService.start(payload);
        navigate(`/auditorias/${audit.id}`);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return { start, isSubmitting, error };
}
