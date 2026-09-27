import { httpClient } from '../../lib/http/httpClient';
import type {
  AuditDetail,
  AuditList,
  AuditSummary,
  ListAuditsParams,
  StartAuditPayload,
} from './types';

/** Quita los filtros vacíos para no enviarlos como `?status=` al backend. */
function compactParams(params: ListAuditsParams): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}

/** Llamadas al módulo de auditorías del backend (`/audits`). */
export const auditsService = {
  async start(payload: StartAuditPayload): Promise<AuditSummary> {
    const { data } = await httpClient.post<AuditSummary>('/audits', payload);
    return data;
  },

  async list(params: ListAuditsParams = {}): Promise<AuditList> {
    const { data } = await httpClient.get<AuditList>('/audits', {
      params: compactParams(params),
    });
    return data;
  },

  async getById(id: string): Promise<AuditDetail> {
    const { data } = await httpClient.get<AuditDetail>(
      `/audits/${encodeURIComponent(id)}`,
    );
    return data;
  },
};
