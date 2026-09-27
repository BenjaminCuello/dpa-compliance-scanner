import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  makeDashboardState,
  sampleDashboard,
} from '../features/dashboard/testFixtures';
import { useDashboardData } from '../features/dashboard/useDashboardData';
import { DashboardPage } from './DashboardPage';

vi.mock('../features/dashboard/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

const useData = vi.mocked(useDashboardData);

/** Muestra la query actual para verificar el parámetro `proyecto`. */
function SearchProbe() {
  return <p data-testid="search">{useLocation().search}</p>;
}

function renderPage(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <>
              <DashboardPage />
              <SearchProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

function stat(label: string) {
  return screen.getByText(label).parentElement as HTMLElement;
}

describe('DashboardPage: vista de un proyecto', () => {
  beforeEach(() => {
    useData.mockReturnValue(makeDashboardState(sampleDashboard()));
  });

  it('al elegir un proyecto muestra sus indicadores y la variación con signo', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText('Proyecto'), 'p1');

    expect(screen.getByTestId('search')).toHaveTextContent('?proyecto=p1');
    expect(stat('Auditorías realizadas')).toHaveTextContent('2');
    expect(stat('Último puntaje')).toHaveTextContent('90,0%');
    expect(stat('Último puntaje')).toHaveTextContent(
      '+20,0 pts respecto de la anterior',
    );
    expect(stat('Hallazgos críticos')).toHaveTextContent('2');
    expect(
      screen.getByRole('link', { name: /Ver última auditoría/ }),
    ).toHaveAttribute('href', '/auditorias/a1');
  });

  it('con una sola auditoría avisa que falta evolución y es la primera', () => {
    renderPage('/dashboard?proyecto=p2');

    expect(stat('Último puntaje')).toHaveTextContent('Primera auditoría');
    expect(
      screen.getByText(/al menos dos auditorías completadas/),
    ).toBeInTheDocument();
  });

  it('abre directo la vista del proyecto indicado en la URL', () => {
    renderPage('/dashboard?proyecto=p3');

    expect(screen.getByLabelText('Proyecto')).toHaveValue('p3');
    expect(stat('Auditorías realizadas')).toHaveTextContent('2');
    expect(screen.queryByText('Proyectos auditados')).not.toBeInTheDocument();
  });

  it('un proyecto inexistente vuelve a "Todos" y limpia el parámetro', async () => {
    renderPage('/dashboard?proyecto=no-existe');

    expect(screen.getByText('Proyectos auditados')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('search').textContent).toBe(''),
    );
  });

  it('desde la tabla de cumplimiento se elige un proyecto', async () => {
    const user = userEvent.setup();
    renderPage();
    const region = screen.getByRole('region', {
      name: 'Cumplimiento por proyecto',
    });

    await user.click(within(region).getByRole('button', { name: 'Ver tabla' }));
    await user.click(
      within(region).getByRole('button', { name: 'Proyecto p2' }),
    );

    expect(screen.getByTestId('search')).toHaveTextContent('?proyecto=p2');
    expect(stat('Auditorías realizadas')).toHaveTextContent('1');
  });

  it('muestra los controles incumplidos de la última auditoría', () => {
    renderPage('/dashboard?proyecto=p1');
    const region = screen.getByRole('region', {
      name: 'Controles incumplidos en la última auditoría',
    });

    expect(within(region).getByText('DPA-SEC-001')).toBeInTheDocument();
    expect(
      within(region).queryByText('Proyectos afectados'),
    ).not.toBeInTheDocument();
  });
});
