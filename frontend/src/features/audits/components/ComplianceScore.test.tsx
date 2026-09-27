import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ComplianceScore } from './ComplianceScore';

describe('ComplianceScore', () => {
  it.each([
    [85.5, '85,5%', 'Bueno', 'text-success-text'],
    [80, '80,0%', 'Bueno', 'text-success-text'],
    [65, '65,0%', 'Regular', 'text-warning-text'],
    [30.25, '30,3%', 'Bajo', 'text-critical-text'],
  ])('muestra %s como %s (%s)', (score, text, level, colorClass) => {
    const { container } = render(<ComplianceScore score={score} />);
    const element = container.firstElementChild;

    expect(element).toHaveTextContent(`${text} (${level})`);
    expect(element).toHaveClass(colorClass);
  });

  it('muestra "—" sin color de nivel cuando no hay puntaje', () => {
    const { container } = render(<ComplianceScore score={null} />);
    const element = container.firstElementChild;

    expect(element).toHaveTextContent('— (Sin puntaje)');
    expect(element).toHaveClass('text-text-muted');
  });
});
