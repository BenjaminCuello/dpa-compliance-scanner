import { describe, expect, it } from 'vitest';
import { makeCheck } from '../audits/testFixtures';
import { findingsBySeverity, topFailedControls } from './failedControls';
import { makeDetail } from './testFixtures';

const finding = { message: 'Hallazgo', filePath: null, line: null };

describe('findingsBySeverity', () => {
  it('suma por severidad en orden de mayor a menor', () => {
    const details = [
      makeDetail('p1', [], { critical: 1, low: 2 }),
      makeDetail('p2', [], { critical: 2, medium: 3 }),
    ];
    expect(findingsBySeverity(details)).toEqual([
      { severity: 'critical', count: 3 },
      { severity: 'high', count: 0 },
      { severity: 'medium', count: 3 },
      { severity: 'low', count: 2 },
    ]);
  });

  it('devuelve ceros sin detalles', () => {
    expect(findingsBySeverity([]).every((item) => item.count === 0)).toBe(true);
  });
});

describe('topFailedControls', () => {
  it('agrupa por código y cuenta proyectos y hallazgos', () => {
    const details = [
      makeDetail('p1', [
        makeCheck('LOG-1', 'failed', 'medium', {
          findings: [finding, finding],
        }),
        makeCheck('OK-1', 'passed', 'critical'),
        makeCheck('SKIP-1', 'skipped', 'high'),
      ]),
      makeDetail('p2', [
        makeCheck('LOG-1', 'failed', 'medium', { findings: [finding] }),
      ]),
    ];

    expect(topFailedControls(details)).toEqual([
      {
        code: 'LOG-1',
        title: 'LOG-1',
        severity: 'medium',
        projectsAffected: 2,
        findings: 3,
      },
    ]);
  });

  it('ordena por proyectos afectados y desempata por severidad', () => {
    const details = [
      makeDetail('p1', [
        makeCheck('LOW-1', 'failed', 'low'),
        makeCheck('CRIT-1', 'failed', 'critical'),
        makeCheck('HIGH-1', 'failed', 'high'),
      ]),
      makeDetail('p2', [
        makeCheck('LOW-1', 'failed', 'low'),
        makeCheck('HIGH-1', 'failed', 'high'),
      ]),
    ];

    expect(topFailedControls(details).map((c) => c.code)).toEqual([
      'HIGH-1',
      'LOW-1',
      'CRIT-1',
    ]);
  });

  it('respeta el límite', () => {
    const checks = ['A', 'B', 'C', 'D', 'E', 'F'].map((code) =>
      makeCheck(code, 'failed', 'low'),
    );
    expect(topFailedControls([makeDetail('p1', checks)])).toHaveLength(5);
    expect(topFailedControls([makeDetail('p1', checks)], 2)).toHaveLength(2);
  });

  it('devuelve vacío sin detalles', () => {
    expect(topFailedControls([])).toEqual([]);
  });
});
