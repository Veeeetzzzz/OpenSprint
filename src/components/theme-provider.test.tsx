import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './theme-provider';

const ThemeProbe = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={() => setTheme('light')}>set-light</button>
    </div>
  );
};

describe('ThemeProvider localStorage safety', () => {
  it('falls back to default theme when localStorage read fails', () => {
    const readSpy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('read blocked');
    });

    render(
      <ThemeProvider defaultTheme="dark" storageKey="test-theme">
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(readSpy).toHaveBeenCalled();
  });

  it('updates state even when localStorage write fails', () => {
    const writeSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('write blocked');
    });

    render(
      <ThemeProvider defaultTheme="dark" storageKey="test-theme">
        <ThemeProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('set-light'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(writeSpy).toHaveBeenCalled();
  });
});
