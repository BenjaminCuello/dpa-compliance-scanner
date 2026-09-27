import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import {
  makeDashboardState,
  makeSummary,
} from '../features/dashboard/testFixtures';
import { useDashboardData } from '../features/dashboard/useDashboardData';
import { DashboardPage } from './DashboardPage';

vi.mock('../features/dashboard/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

const useData = vi.mocked(useDashboardData);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function stat(label: string) {
  return screen.getByText(label).parentElement as HTMLElement;
}

describe('DashboardPage: estados', () => {
  it('sin auditorías muestra el estado vacío con enlace a /auditorias', () => {
    useData.mockReturnValue(makeDashboardState());
    renderPage();

    expect(
      screen.getByText('Aún no hay datos de cumplimiento'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir a auditorías' }),
    ).toHaveAttribute('href', '/auditorias');
  });

  it('sin auditorías completadas los gráficos esperan la primera', () => {
    const summaries = [makeSummary('a1', 'p1', 1, null, 'running')];
    useData.mockReturnValue(makeDashboardState({ summaries }));
    renderPage();

    expect(stat('Proyectos auditados')).toHaveTextContent('1');
    expect(
      screen.getAllByText(/aparecerá cuando termine la primera auditoría/),
    ).toHaveLength(2);
  });

  it('si falla el listado muestra el error y permite reintentar', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    useData.mockReturnValue(
      makeDashboardState({ error: 'No se pudo cargar', reload }),
    );
    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    expect(reload).toHaveBeenCalledOnce();
  });
});
