import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auditsService } from './auditsService';
import type { AuditList, ListAuditsParams } from './types';
import { useAuditHistory } from './useAuditHistory';

vi.mock('./auditsService', () => ({
  auditsService: { list: vi.fn() },
}));

const list = vi.mocked(auditsService.list);

function page(number: number): AuditList {
  return { items: [], total: 0, page: number, limit: 20 };
}

describe('useAuditHistory', () => {
  beforeEach(() => {
    list.mockReset();
    list.mockImplementation(async (params) => page(params?.page ?? 1));
  });

  it('vuelve a pedir al cambiar la página o el filtro', async () => {
    const { result, rerender } = renderHook(
      (params: ListAuditsParams) => useAuditHistory(params),
      { initialProps: { page: 1 } as ListAuditsParams },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.page).toBe(1);

    rerender({ page: 2 });
    await waitFor(() => expect(result.current.data?.page).toBe(2));

    rerender({ page: 2, status: 'failed' });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(list).toHaveBeenCalledTimes(3);
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, status: 'failed' }),
    );
  });

  it('no vuelve a pedir si los parámetros son iguales', async () => {
    const { result, rerender } = renderHook(
      (params: ListAuditsParams) => useAuditHistory(params),
      { initialProps: { page: 1 } as ListAuditsParams },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ page: 1 });

    expect(list).toHaveBeenCalledTimes(1);
  });

  it('ignora la respuesta tardía de una petición anterior', async () => {
    let resolveFirst: (value: AuditList) => void = () => {};
    list.mockImplementationOnce(
      () => new Promise((resolve) => (resolveFirst = resolve)),
    );

    const { result, rerender } = renderHook(
      (params: ListAuditsParams) => useAuditHistory(params),
      { initialProps: { page: 1 } as ListAuditsParams },
    );
    rerender({ page: 2 });
    await waitFor(() => expect(result.current.data?.page).toBe(2));

    await act(async () => resolveFirst(page(1)));
    expect(result.current.data?.page).toBe(2);
  });

  it('reload vuelve a pedir con los mismos parámetros', async () => {
    const { result } = renderHook(() => useAuditHistory({ page: 1 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(list).toHaveBeenCalledTimes(2);
  });
});
