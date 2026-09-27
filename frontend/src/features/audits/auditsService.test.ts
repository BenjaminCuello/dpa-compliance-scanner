import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../lib/http/httpClient';
import { auditsService } from './auditsService';

vi.mock('../../lib/http/httpClient', () => ({
  httpClient: { post: vi.fn(), get: vi.fn() },
}));

describe('auditsService', () => {
  beforeEach(() => {
    vi.mocked(httpClient.post).mockReset();
    vi.mocked(httpClient.get).mockReset();
  });

  it('inicia una auditoría con repositorio y nombre en /audits', async () => {
    const summary = { id: 'a1', status: 'pending' };
    vi.mocked(httpClient.post).mockResolvedValue({ data: summary });
    const payload = {
      repositoryUrl: 'https://github.com/organizacion/proyecto',
      projectName: 'Portal',
    };

    const result = await auditsService.start(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/audits', payload);
    expect(result).toEqual(summary);
  });

  it('inicia una auditoría sobre un proyecto existente', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: {} });

    await auditsService.start({ projectId: 'p1' });

    expect(httpClient.post).toHaveBeenCalledWith('/audits', {
      projectId: 'p1',
    });
  });

  it('consulta el historial con filtros y paginación', async () => {
    const list = { items: [], total: 0, page: 2, limit: 10 };
    vi.mocked(httpClient.get).mockResolvedValue({ data: list });

    const result = await auditsService.list({
      projectId: 'p1',
      status: 'completed',
      page: 2,
      limit: 10,
    });

    expect(httpClient.get).toHaveBeenCalledWith('/audits', {
      params: { projectId: 'p1', status: 'completed', page: 2, limit: 10 },
    });
    expect(result).toEqual(list);
  });

  it('omite los filtros vacíos o sin definir', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: {} });

    await auditsService.list({ projectId: undefined, status: '', page: 1 });
    await auditsService.list();

    expect(httpClient.get).toHaveBeenNthCalledWith(1, '/audits', {
      params: { page: 1 },
    });
    expect(httpClient.get).toHaveBeenNthCalledWith(2, '/audits', {
      params: {},
    });
  });

  it('consulta el detalle en /audits/:id', async () => {
    const detail = { id: 'a1', status: 'completed', checks: [] };
    vi.mocked(httpClient.get).mockResolvedValue({ data: detail });

    const result = await auditsService.getById('a1');

    expect(httpClient.get).toHaveBeenCalledWith('/audits/a1');
    expect(result).toEqual(detail);
  });
});
