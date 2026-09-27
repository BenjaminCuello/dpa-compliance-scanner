import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auditsService } from '../features/audits/auditsService';
import { makeAuditDetail as detail } from '../features/audits/testFixtures';
import { AuditDetailPage } from './AuditDetailPage';

vi.mock('../features/audits/auditsService', () => ({
  auditsService: { getById: vi.fn(), start: vi.fn() },
}));

const getById = vi.mocked(auditsService.getById);
const start = vi.mocked(auditsService.start);

function renderPage(id = 'a1') {
  return render(
    <MemoryRouter initialEntries={[`/auditorias/${id}`]}>
      <Routes>
        <Route path="/auditorias" element={<p>Historial</p>} />
        <Route path="/auditorias/:id" element={<AuditDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuditDetailPage', () => {
  beforeEach(() => {
    getById.mockReset();
    start.mockReset();
  });

  it('muestra primero los incumplidos ordenados por severidad', async () => {
    getById.mockResolvedValue(detail('a1', 'completed'));
    renderPage();

    const list = await screen.findByRole('list', {
      name: 'Controles evaluados',
    });
    const codes = within(list)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('.font-mono')?.textContent);

    expect(codes).toEqual(['SEC-1', 'MED-1', 'LOW-1', 'OK-1', 'SKIP-1']);
  });

  it('despliega la remediación y los hallazgos al expandir', async () => {
    const user = userEvent.setup();
    getById.mockResolvedValue(detail('a1', 'completed'));
    renderPage();

    const toggle = await screen.findByRole('button', {
      name: /Ver detalle de SEC-1/,
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('src/x.ts:12')).not.toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(
      toggle.getAttribute('aria-controls')!,
    );
    expect(panel).toBeVisible();
    expect(
      within(panel!).getByText(/variables de entorno/),
    ).toBeInTheDocument();
    expect(within(panel!).getByText('Clave API expuesta')).toBeInTheDocument();
    expect(within(panel!).getByText('src/x.ts:12')).toBeInTheDocument();
  });

  it('muestra el aviso con errorMessage si la auditoría falló', async () => {
    getById.mockResolvedValue(detail('a1', 'failed'));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo clonar el repositorio',
    );
    expect(screen.queryByRole('button', { name: /Reintentar/ })).toBeNull();
  });

  it('muestra "Auditoría no encontrada" ante un 404', async () => {
    const response = {
      status: 404,
      data: { message: 'No existe' },
    } as AxiosResponse;
    getById.mockRejectedValue(
      new AxiosError('No existe', '404', undefined, null, response),
    );
    renderPage();

    expect(
      await screen.findByText('Auditoría no encontrada'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir al historial' }),
    ).toHaveAttribute('href', '/auditorias');
  });

  it('muestra el progreso si está en ejecución', async () => {
    getById.mockResolvedValue(detail('a1', 'running'));
    renderPage();

    const message = await screen.findByText('Analizando el repositorio…');
    expect(message.closest('[aria-live="polite"]')).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: /Volver a auditar/ }),
    ).toBeNull();
  });

  it('"Volver a auditar" inicia una auditoría del proyecto y navega a ella', async () => {
    const user = userEvent.setup();
    getById.mockImplementation(async (id) =>
      detail(id, id === 'a1' ? 'completed' : 'pending'),
    );
    start.mockResolvedValue(detail('a2', 'pending'));
    renderPage();

    await user.click(
      await screen.findByRole('button', { name: /Volver a auditar/ }),
    );

    expect(start).toHaveBeenCalledWith({ projectId: 'p1' });
    expect(
      await screen.findByText('La auditoría está en cola'),
    ).toBeInTheDocument();
    expect(getById).toHaveBeenLastCalledWith('a2');
  });
});
