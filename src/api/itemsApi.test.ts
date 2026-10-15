import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TreeItem } from '@/tree/types';
import { LOAD_DELAY_MS, fetchItems } from './itemsApi';

const data: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: 2, parent: 1, label: 'Айтем 2' },
];

describe('fetchItems', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve(data) })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('delays the response by LOAD_DELAY_MS before fetching', async () => {
    const promise = fetchItems();

    await vi.advanceTimersByTimeAsync(LOAD_DELAY_MS - 1);
    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith('/items.json', { signal: undefined });
  });

  it('rejects when the request is aborted', async () => {
    const controller = new AbortController();
    const promise = fetchItems(controller.signal);
    controller.abort();

    await expect(promise).rejects.toThrow(/Aborted/);
  });
});
