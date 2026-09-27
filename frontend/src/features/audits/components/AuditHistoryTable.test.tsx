import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { auditsService } from '../auditsService';
import type { AuditSummary } from '../types';
import { AuditHistoryTable } from './AuditHistoryTable';

vi.mock('../auditsService', () => ({
  auditsService: { list: vi.fn(), start: vi.fn() },
}));

const start = vi.mocked(auditsService.start);

function completed(id: string): AuditSummary {
  return {
    id,
    status: 'completed',
    complianceScore: 80,
    project: {
      id: `p-${id}`,
      name: id,
      repositoryUrl: 'https://github.com/o/p',
    },
    createdAt: '2026-09-27T14:05:00.000Z',
    startedAt: null,
    finishedAt: null,
    errorMessage: null,
  };
}

describe('AuditHistoryTable', () => {
  it('mientras se envía una re-auditoría deshabilita las demás filas', async () => {
    const user = userEvent.setup();
    start.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <AuditHistoryTable audits={['a1', 'a2', 'a3'].map(completed)} />
      </MemoryRouter>,
    );

    const [, first, second, third] = screen.getAllByRole('row');
    await user.click(
      within(second).getByRole('button', { name: 'Volver a auditar' }),
    );

    expect(start).toHaveBeenCalledWith({ projectId: 'p-a2' });
    expect(within(second).getByRole('button')).toHaveTextContent('Iniciando…');
    for (const row of [first, third]) {
      const button = within(row).getByRole('button');
      expect(button).toHaveTextContent('Volver a auditar');
      expect(button).toBeDisabled();
    }
  });
});
