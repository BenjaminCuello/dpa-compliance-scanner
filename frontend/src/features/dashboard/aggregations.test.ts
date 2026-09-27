import { describe, expect, it } from 'vitest';
import {
  computeOverview,
  computeProjectOverview,
  latestCompletedByProject,
  projectScores,
  scoreTrend,
} from './aggregations';
import { makeDetail, makeSummary } from './testFixtures';

const history = [
  makeSummary('a5', 'p1', 5, null, 'running'),
  makeSummary('a4', 'p1', 4, null, 'failed'),
  makeSummary('a3', 'p2', 3, 66.67),
  makeSummary('a2', 'p1', 2, 33.33),
  makeSummary('a1', 'p1', 1, 20),
  makeSummary('a0', 'p3', 1, null, 'pending'),
];

describe('latestCompletedByProject', () => {
  it('devuelve la última completada por proyecto, la más reciente primero', () => {
    expect(latestCompletedByProject(history).map((s) => s.id)).toEqual([
      'a3',
      'a2',
    ]);
  });

  it('ordena por finishedAt aunque el listado venga desordenado', () => {
    const shuffled = [history[4], history[3], history[2]];
    expect(latestCompletedByProject(shuffled).map((s) => s.id)).toEqual([
      'a3',
      'a2',
    ]);
  });

  it('devuelve vacío sin auditorías', () => {
    expect(latestCompletedByProject([])).toEqual([]);
  });
});

describe('computeOverview', () => {
  it('calcula los indicadores ignorando auditorías no completadas', () => {
    const details = [
      makeDetail('p1', [], { critical: 2 }),
      makeDetail('p2', [], { critical: 1, high: 4 }),
    ];

    expect(computeOverview(history, details)).toEqual({
      projectsCount: 3,
      completedCount: 3,
      averageScore: 50,
      criticalFindings: 3,
    });
  });

  it('redondea el promedio a dos decimales', () => {
    const summaries = [
      makeSummary('a', 'p1', 1, 10),
      makeSummary('b', 'p2', 1, 20),
      makeSummary('c', 'p3', 1, 20.01),
    ];
    expect(computeOverview(summaries, []).averageScore).toBe(16.67);
  });

  it('usa null como promedio sin auditorías completadas', () => {
    expect(computeOverview([], [])).toEqual({
      projectsCount: 0,
      completedCount: 0,
      averageScore: null,
      criticalFindings: 0,
    });
    expect(computeOverview([history[0]], []).averageScore).toBeNull();
  });
});

describe('computeProjectOverview', () => {
  const p1 = history.filter((s) => s.project.id === 'p1');

  it('compara el último puntaje con el anterior completado', () => {
    expect(
      computeProjectOverview(p1, makeDetail('p1', [], { critical: 2 })),
    ).toEqual({
      auditsCount: 4,
      lastScore: 33.33,
      previousScore: 20,
      scoreDelta: 13.33,
      criticalFindings: 2,
    });
  });

  it('deja scoreDelta en null con una sola auditoría completada', () => {
    const overview = computeProjectOverview(
      [makeSummary('x', 'p9', 1, 75)],
      null,
    );
    expect(overview).toEqual({
      auditsCount: 1,
      lastScore: 75,
      previousScore: null,
      scoreDelta: null,
      criticalFindings: null,
    });
  });

  it('sin auditorías devuelve todo vacío', () => {
    expect(computeProjectOverview([], null)).toEqual({
      auditsCount: 0,
      lastScore: null,
      previousScore: null,
      scoreDelta: null,
      criticalFindings: null,
    });
  });
});

describe('scoreTrend', () => {
  it('lista las completadas del proyecto de la más antigua a la más reciente', () => {
    expect(scoreTrend(history, 'p1')).toEqual([
      { auditId: 'a1', finishedAt: history[4].finishedAt, score: 20 },
      { auditId: 'a2', finishedAt: history[3].finishedAt, score: 33.33 },
    ]);
  });

  it('devuelve vacío para un proyecto sin auditorías completadas', () => {
    expect(scoreTrend(history, 'p3')).toEqual([]);
    expect(scoreTrend([], 'p1')).toEqual([]);
  });
});

describe('projectScores', () => {
  it('ordena de menor a mayor puntaje y desempata por nombre', () => {
    const latest = [
      makeSummary('a', 'p2', 1, 80),
      makeSummary('b', 'p3', 1, 40),
      makeSummary('c', 'p1', 1, 40),
    ];
    expect(projectScores(latest).map((p) => [p.projectId, p.score])).toEqual([
      ['p1', 40],
      ['p3', 40],
      ['p2', 80],
    ]);
  });

  it('devuelve vacío sin auditorías', () => {
    expect(projectScores([])).toEqual([]);
  });
});
