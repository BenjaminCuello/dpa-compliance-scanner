import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AUDIT_STATUS_LABELS,
  CHECK_SEVERITY_LABELS,
  CHECK_STATUS_LABELS,
} from '../labels';
import type { AuditStatus, CheckSeverity, CheckStatus } from '../types';
import { AuditStatusBadge } from './AuditStatusBadge';
import { CheckStatusBadge } from './CheckStatusBadge';
import { SeverityBadge } from './SeverityBadge';

describe('AuditStatusBadge', () => {
  it.each([
    ['pending', 'En cola'],
    ['running', 'En ejecución'],
    ['completed', 'Completada'],
    ['failed', 'Fallida'],
  ] as [AuditStatus, string][])('muestra %s como "%s"', (status, text) => {
    render(<AuditStatusBadge status={status} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(AUDIT_STATUS_LABELS[status]).toBe(text);
  });
});

describe('CheckStatusBadge', () => {
  it.each([
    ['passed', 'Aprobado'],
    ['failed', 'Incumplido'],
    ['skipped', 'Omitido'],
  ] as [CheckStatus, string][])('muestra %s como "%s"', (status, text) => {
    render(<CheckStatusBadge status={status} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(CHECK_STATUS_LABELS[status]).toBe(text);
  });
});

describe('SeverityBadge', () => {
  it.each([
    ['critical', 'Crítica'],
    ['high', 'Alta'],
    ['medium', 'Media'],
    ['low', 'Baja'],
  ] as [CheckSeverity, string][])(
    'muestra %s como "%s" con su token de color',
    (severity, text) => {
      render(<SeverityBadge severity={severity} />);

      const badge = screen.getByText(text);
      expect(badge).toHaveClass(`text-severity-${severity}`);
      expect(CHECK_SEVERITY_LABELS[severity]).toBe(text);
    },
  );
});
