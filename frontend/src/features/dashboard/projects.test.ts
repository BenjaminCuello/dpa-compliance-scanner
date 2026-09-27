import { describe, expect, it } from 'vitest';
import { projectOptions, recentAudits } from './projects';
import { makeSummary } from './testFixtures';

describe('projectOptions', () => {
  it('devuelve cada proyecto una vez, ordenado por nombre', () => {
    const summaries = [
      makeSummary('a1', 'zeta', 3),
      makeSummary('a2', 'alfa', 2),
      makeSummary('a3', 'zeta', 1),
    ];

    expect(projectOptions(summaries).map((project) => project.id)).toEqual([
      'alfa',
      'zeta',
    ]);
  });

  it('devuelve una lista vacía sin auditorías', () => {
    expect(projectOptions([])).toEqual([]);
  });
});

describe('recentAudits', () => {
  const summaries = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map((id, index) =>
    makeSummary(id, index % 2 === 0 ? 'p1' : 'p2', 20 - index),
  );

  it('devuelve las 5 primeras del listado', () => {
    expect(recentAudits(summaries).map((audit) => audit.id)).toEqual([
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
    ]);
  });

  it('filtra por proyecto', () => {
    expect(recentAudits(summaries, 'p2').map((audit) => audit.id)).toEqual([
      'a2',
      'a4',
      'a6',
    ]);
  });
});
