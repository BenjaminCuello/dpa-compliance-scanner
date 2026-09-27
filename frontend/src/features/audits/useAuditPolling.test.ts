import { act, renderHook } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { auditsService } from './auditsService';
import type { AuditDetail, AuditStatus } from './types';
import { POLL_INTERVAL_MS, useAuditPolling } from './useAuditPolling';

vi.mock('./auditsService', () => ({
  auditsService: { getById: vi.fn() },
}));

const getById = vi.mocked(auditsService.getById);

function detail(status: AuditStatus): AuditDetail {
  return { id: 'a1', status } as AuditDetail;
}

function httpError(status: number, message: string): AxiosError {
  const response = { status, data: { message } } as AxiosResponse;
  return new AxiosError(message, String(status), undefined, null, response);
}

/** Avanza los timers falsos y deja resolver las promesas pendientes. */
async function advance(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

describe('useAuditPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getById.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('vuelve a consultar mientras está en curso y se detiene al completar', async () => {
    getById
      .mockResolvedValueOnce(detail('running'))
      .mockResolvedValueOnce(detail('running'))
      .mockResolvedValueOnce(detail('completed'));

    const { result } = renderHook(() => useAuditPolling('a1'));
    expect(result.current.isLoading).toBe(true);

    await advance(0);
    expect(result.current.audit?.status).toBe('running');
    expect(result.current.isLoading).toBe(false);

    await advance(POLL_INTERVAL_MS);
    await advance(POLL_INTERVAL_MS);
    expect(result.current.audit?.status).toBe('completed');

    await advance(POLL_INTERVAL_MS * 3);
    expect(getById).toHaveBeenCalledTimes(3);
  });

  it('se detiene cuando la auditoría falla', async () => {
    getById
      .mockResolvedValueOnce(detail('pending'))
      .mockResolvedValueOnce(detail('failed'));

    const { result } = renderHook(() => useAuditPolling('a1'));
    await advance(0);
    await advance(POLL_INTERVAL_MS);
    expect(result.current.audit?.status).toBe('failed');

    await advance(POLL_INTERVAL_MS * 3);
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it('marca notFound ante un 404 y no sigue consultando', async () => {
    getById.mockRejectedValue(httpError(404, 'La auditoría no existe'));

    const { result } = renderHook(() => useAuditPolling('a1'));
    await advance(0);

    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBe('La auditoría no existe');
    await advance(POLL_INTERVAL_MS * 3);
    expect(getById).toHaveBeenCalledTimes(1);
  });

  it('no sigue consultando tras desmontar', async () => {
    getById.mockResolvedValue(detail('running'));

    const { unmount } = renderHook(() => useAuditPolling('a1'));
    await advance(0);
    unmount();

    await advance(POLL_INTERVAL_MS * 3);
    expect(getById).toHaveBeenCalledTimes(1);
  });

  it('se detiene ante un error de red y retry reanuda el polling', async () => {
    getById
      .mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
      .mockResolvedValue(detail('running'));

    const { result } = renderHook(() => useAuditPolling('a1'));
    await advance(0);
    expect(result.current.error).not.toBeNull();
    expect(result.current.notFound).toBe(false);

    await advance(POLL_INTERVAL_MS * 3);
    expect(getById).toHaveBeenCalledTimes(1);

    act(() => result.current.retry());
    expect(result.current.error).toBeNull();
    await advance(0);
    expect(getById).toHaveBeenCalledTimes(2);
    expect(result.current.audit?.status).toBe('running');

    await advance(POLL_INTERVAL_MS);
    expect(getById).toHaveBeenCalledTimes(3);
  });
});
