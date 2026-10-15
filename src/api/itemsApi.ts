import type { TreeItem } from '@/tree/types';

/** Artificial server latency used to demonstrate the loading state. */
export const LOAD_DELAY_MS = 2000;

/** Resolves after `ms`, honouring an optional abort signal. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort(): void {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }

    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Loads the tree items from `items.json` at runtime, imitating a real request
 * to a backend: the data is not bundled, it is fetched via `fetch` and the
 * response is deliberately delayed by {@link LOAD_DELAY_MS}.
 */
export async function fetchItems(signal?: AbortSignal): Promise<TreeItem[]> {
  await delay(LOAD_DELAY_MS, signal);

  const response = await fetch(`${import.meta.env.BASE_URL}items.json`, { signal });
  return (await response.json()) as TreeItem[];
}
