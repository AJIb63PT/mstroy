import type { TreeItem } from '@/tree/types';

export const LOAD_DELAY_MS = 2000;

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

export async function fetchItems(signal?: AbortSignal): Promise<TreeItem[]> {
  await delay(LOAD_DELAY_MS, signal);

  const response = await fetch(`${import.meta.env.BASE_URL}items.json`, { signal });
  return (await response.json()) as TreeItem[];
}
