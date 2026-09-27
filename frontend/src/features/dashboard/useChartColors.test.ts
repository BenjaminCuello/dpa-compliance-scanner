import { renderHook, waitFor } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { useChartColors } from './useChartColors';

/** jsdom no carga Tailwind: se simulan los tokens de cada tema. */
const TOKENS: Record<'light' | 'dark', Record<string, string>> = {
  light: {
    '--color-chart-primary': '#0284c7',
    '--color-text': '#1a1d23',
    '--color-bg': '#ffffff',
  },
  dark: {
    '--color-chart-primary': '#38bdf8',
    '--color-text': '#f4f4f5',
    '--color-bg': '#18181b',
  },
};

const root = document.documentElement;

describe('useChartColors', () => {
  let spy: MockInstance<typeof window.getComputedStyle>;

  beforeEach(() => {
    spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      const tokens = TOKENS[root.classList.contains('dark') ? 'dark' : 'light'];
      return {
        getPropertyValue: (name: string) => ` ${tokens[name] ?? ''}`,
      } as CSSStyleDeclaration;
    });
  });

  afterEach(() => {
    spy.mockRestore();
    root.classList.remove('dark');
  });

  it('lee los tokens y cambia al alternar la clase dark', async () => {
    const { result } = renderHook(() => useChartColors());
    expect(result.current.primary).toBe('#0284c7');
    expect(result.current.text).toBe('#1a1d23');
    expect(result.current.bg).toBe('#ffffff');

    root.classList.add('dark');
    await waitFor(() => expect(result.current.primary).toBe('#38bdf8'));
    expect(result.current.text).toBe('#f4f4f5');
    expect(result.current.bg).toBe('#18181b');

    root.classList.remove('dark');
    await waitFor(() => expect(result.current.primary).toBe('#0284c7'));
  });

  it('deja de observar al desmontar', async () => {
    const { unmount } = renderHook(() => useChartColors());
    const reads = spy.mock.calls.length;

    unmount();
    root.classList.add('dark');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(spy.mock.calls.length).toBe(reads);
  });
});
