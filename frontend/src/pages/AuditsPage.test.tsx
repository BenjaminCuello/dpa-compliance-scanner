import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auditsService } from '../features/audits/auditsService';
import type { AuditStatus, AuditSummary } from '../features/audits/types';
import { AuditsPage } from './AuditsPage';

vi.mock('../features/audits/auditsService', () => ({
  auditsService: { list: vi.fn(), start: vi.fn() },
}));

const list = vi.mocked(auditsService.list);
const start = vi.mocked(auditsService.start);

function audit(id: string, status: AuditStatus, name = 'Portal'): AuditSummary {
  return {
    id,
    status,
    complianceScore: status === 'completed' ? 85.5 : null,
    project: { id: `p-${id}`, name, repositoryUrl: 'https://github.com/o/p' },
    createdAt: '2026-09-27T14:05:00.000Z',
    startedAt: null,
    finishedAt: null,
    errorMessage: null,
  };
}

function conflict(message: string): AxiosError {
  const response = { status: 409, data: { message } } as AxiosResponse;
  return new AxiosError(message, '409', undefined, null, response);
}

function Detail() {
  return <p>Detalle {useParams().id}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/auditorias']}>
      <Routes>
        <Route path="/auditorias" element={<AuditsPage />} />
        <Route path="/auditorias/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuditsPage', () => {
  beforeEach(() => {
    list.mockReset();
    start.mockReset();
    list.mockImplementation(async (params) => ({
      items: [audit('a1', 'running', 'Activo'), audit('a2', 'completed')],
      total: 45,
      page: params?.page ?? 1,
      limit: 20,
    }));
  });

  it('envía el formulario y navega al detalle de la auditoría creada', async () => {
    const user = userEvent.setup();
    start.mockResolvedValue(audit('a-nueva', 'pending'));
    renderPage();

    await user.type(
      screen.getByLabelText(/URL del repositorio/),
      'https://github.com/organizacion/proyecto',
    );
    await user.type(screen.getByLabelText(/Nombre del proyecto/), 'Portal');
    await user.click(screen.getByRole('button', { name: /Iniciar auditoría/ }));

    expect(start).toHaveBeenCalledWith({
      repositoryUrl: 'https://github.com/organizacion/proyecto',
      projectName: 'Portal',
    });
    expect(await screen.findByText('Detalle a-nueva')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409', async () => {
    const user = userEvent.setup();
    start.mockRejectedValue(
      conflict('El proyecto ya tiene una auditoría en curso'),
    );
    renderPage();

    await user.type(
      screen.getByLabelText(/URL del repositorio/),
      'https://github.com/organizacion/proyecto',
    );
    await user.click(screen.getByRole('button', { name: /Iniciar auditoría/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El proyecto ya tiene una auditoría en curso',
    );
  });

  it('al cambiar el filtro pide la página 1 con ese estado', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: /Siguiente/ }));
    await screen.findByText('Página 2 de 3');

    await user.selectOptions(screen.getByLabelText('Estado'), 'failed');

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        status: 'failed',
        page: 1,
        limit: 20,
        projectId: undefined,
      }),
    );
  });

  it('"Volver a auditar" se deshabilita en curso y re-audita el proyecto', async () => {
    const user = userEvent.setup();
    start.mockResolvedValue(audit('a3', 'pending'));
    renderPage();

    const [, runningRow, completedRow] = await screen.findAllByRole('row');
    const reaudit = { name: /Volver a auditar/ };
    expect(within(runningRow).getByRole('button', reaudit)).toBeDisabled();

    await user.click(within(completedRow).getByRole('button', reaudit));

    expect(start).toHaveBeenCalledWith({ projectId: 'p-a2' });
    expect(await screen.findByText('Detalle a3')).toBeInTheDocument();
  });

  it('el enlace del proyecto lleva al detalle', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole('link', {
        name: 'Ver detalle de la auditoría de Activo',
      }),
    );

    expect(await screen.findByText('Detalle a1')).toBeInTheDocument();
  });
});
