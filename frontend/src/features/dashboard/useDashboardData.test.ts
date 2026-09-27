import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auditsService } from '../audits/auditsService';
import type { AuditDetail, AuditList, AuditSummary } from '../audits/types';
import { makeDetail, makeSummary } from './testFixtures';
import { useDashboardData } from './useDashboardData';

vi.mock('../audits/auditsService', () => ({
  auditsService: { list: vi.fn(), getById: vi.fn() },
}));

const list = vi.mocked(auditsService.list);
const getById = vi.mocked(auditsService.getById);

/** Historial de `count` auditorías, una por proyecto, servido por páginas. */
function serveHistory(count: number) {
  const all = Array.from({ length: count }, (_, i) =>
    makeSummary(`a${i}`, `p${i}`, (i % 28) + 1),
  );
  list.mockImplementation(async (params) => {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const items = all.slice((page - 1) * limit, page * limit);
    return { items, total: count, page, limit } satisfies AuditList;
  });
}

function detailFor(id: string): AuditDetail {
  return { ...makeDetail(id.replace('a', 'p')), id };
}

describe('useDashboardData', () => {
  beforeEach(() => {
    list.mockReset();
    getById.mockReset();
    getById.mockImplementation(async (id) => detailFor(id));
  });

  it('recorre las páginas hasta completar total', async () => {
    serveHistory(250);
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(list).toHaveBeenCalledTimes(3);
    expect(list).toHaveBeenLastCalledWith({ page: 3, limit: 100 });
    expect(result.current.summaries).toHaveLength(250);
    expect(result.current.isTruncated).toBe(false);
    expect(result.current.latestDetails).toHaveLength(20);
  });

  it('se detiene en 5 páginas y marca isTruncated', async () => {
    serveHistory(650);
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(list).toHaveBeenCalledTimes(5);
    expect(result.current.summaries).toHaveLength(500);
    expect(result.current.isTruncated).toBe(true);
  });

  it('nunca tiene más de 4 detalles en vuelo', async () => {
    serveHistory(25);
    let inFlight = 0;
    let maxInFlight = 0;
    getById.mockImplementation(async (id) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight -= 1;
      return detailFor(id);
    });

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getById).toHaveBeenCalledTimes(20);
    expect(maxInFlight).toBe(4);
  });

  it('un detalle que falla no rompe el resto', async () => {
    serveHistory(3);
    getById.mockImplementation(async (id) => {
      if (id === 'a1') throw new Error('falla');
      return detailFor(id);
    });

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.latestDetails.map((d) => d.id).sort()).toEqual([
      'a0',
      'a2',
    ]);
  });

  it('marca error si falla el listado', async () => {
    list.mockRejectedValue(new Error('caído'));
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(getById).not.toHaveBeenCalled();
  });

  it('al recargar conserva los datos e ignora respuestas tardías', async () => {
    serveHistory(2);
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let resolveLate: (value: AuditList) => void = () => {};
    list.mockImplementationOnce(
      () => new Promise((resolve) => (resolveLate = resolve)),
    );
    act(() => result.current.reload());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.summaries).toHaveLength(2);

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const late: AuditSummary[] = [makeSummary('x', 'px', 1)];
    await act(async () =>
      resolveLate({ items: late, total: 1, page: 1, limit: 100 }),
    );
    expect(result.current.summaries).toHaveLength(2);
  });
});
