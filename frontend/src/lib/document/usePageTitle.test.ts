import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  it('fija el título con el nombre de la aplicación', () => {
    renderHook(() => usePageTitle('Panel'));

    expect(document.title).toBe('Panel · DPA Compliance Scanner');
  });

  it('actualiza el título cuando cambia', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Auditoría' },
    });

    rerender({ title: 'Auditoría de demo' });

    expect(document.title).toBe('Auditoría de demo · DPA Compliance Scanner');
  });
});
