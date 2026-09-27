import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  makeDashboardState,
  makeSummary,
  sampleDashboard,
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
        <Route path="/auditorias" element={<p>Historial</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Tarjeta de indicador por su etiqueta. */
function stat(label: string) {
  return screen.getByText(label).parentElement as HTMLElement;
}

/** Nombres de las filas de la tabla, sin la cabecera. */
function rowNames(region: HTMLElement) {
  return within(region)
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent);
}

describe('DashboardPage: todos los proyectos', () => {
  beforeEach(() => {
    useData.mockReturnValue(makeDashboardState(sampleDashboard()));
  });

  it('muestra los indicadores generales', () => {
    renderPage();

    expect(stat('Proyectos auditados')).toHaveTextContent('3');
    expect(stat('Auditorías completadas')).toHaveTextContent('4');
    expect(stat('Cumplimiento promedio')).toHaveTextContent('63,3%');
    expect(stat('Hallazgos críticos vigentes')).toHaveTextContent('3');
  });

  it('"Ver tabla" muestra los proyectos de menor a mayor puntaje', async () => {
    const user = userEvent.setup();
    renderPage();
    const region = screen.getByRole('region', {
      name: 'Cumplimiento por proyecto',
    });

    const toggle = within(region).getByRole('button', { name: 'Ver tabla' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);

    expect(
      within(region).getByRole('button', { name: /Ver gráfico/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(rowNames(region)).toEqual([
      'Proyecto p2',
      'Proyecto p3',
      'Proyecto p1',
    ]);
  });

  it('con más de 10 proyectos avisa del tope y la tabla los incluye todos', async () => {
    const user = userEvent.setup();
    const summaries = Array.from({ length: 12 }, (_, index) =>
      makeSummary(`a${index}`, `p${index + 10}`, index + 1, index * 5),
    );
    useData.mockReturnValue(makeDashboardState({ summaries }));
    renderPage();
    const region = screen.getByRole('region', {
      name: 'Cumplimiento por proyecto',
    });

    expect(
      within(region).getByText(
        /Se muestran los 10 proyectos con menor puntaje/,
      ),
    ).toBeInTheDocument();
    await user.click(within(region).getByRole('button', { name: 'Ver tabla' }));

    expect(rowNames(region)).toHaveLength(12);
  });

  it('lista las auditorías recientes con enlace al historial', () => {
    renderPage();
    const region = screen.getByRole('region', { name: 'Auditorías recientes' });

    expect(within(region).getAllByRole('listitem')).toHaveLength(5);
    expect(
      within(region).getByRole('link', { name: /Ver historial completo/ }),
    ).toHaveAttribute('href', '/auditorias');
  });

  it('avisa cuando el panel considera solo las auditorías más recientes', () => {
    useData.mockReturnValue(
      makeDashboardState({ ...sampleDashboard(), isTruncated: true }),
    );
    renderPage();

    expect(
      screen.getByText(/considera las 500 auditorías más recientes/),
    ).toBeInTheDocument();
  });
});
