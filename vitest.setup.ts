import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const localStore = new Map<string, string>();
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: (key: string) => (localStore.has(key) ? localStore.get(key)! : null),
    setItem: (key: string, value: string) => {
      localStore.set(key, value);
    },
    removeItem: (key: string) => {
      localStore.delete(key);
    },
    clear: () => {
      localStore.clear();
    },
    key: (index: number) => Array.from(localStore.keys())[index] ?? null,
    get length() {
      return localStore.size;
    },
  },
});

afterEach(() => {
  cleanup();
  localStore.clear();
  vi.restoreAllMocks();
});
