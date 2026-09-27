import { describe, expect, it } from 'vitest';
import { sortChecks } from './checks';
import { makeCheck as check } from './testFixtures';

describe('sortChecks', () => {
  it('deja primero los incumplidos por severidad, luego aprobados y omitidos', () => {
    const checks = [
      check('A', 'passed', 'critical'),
      check('B', 'failed', 'low'),
      check('C', 'skipped', 'high'),
      check('D', 'failed', 'critical'),
      check('E', 'failed', 'medium'),
      check('F', 'passed', 'low'),
    ];

    expect(sortChecks(checks).map((c) => c.code)).toEqual([
      'D',
      'E',
      'B',
      'A',
      'F',
      'C',
    ]);
  });

  it('no modifica el arreglo original', () => {
    const checks = [check('A', 'passed', 'low'), check('B', 'failed', 'low')];

    sortChecks(checks);

    expect(checks.map((c) => c.code)).toEqual(['A', 'B']);
  });
});
