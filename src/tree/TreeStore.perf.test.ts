import { describe, expect, it } from 'vitest';

import { TreeStore } from './TreeStore';
import type { TreeItem, TreeItemId } from './types';

const TOTAL = 200_000;
const DEPTH = 1_000;

function buildLargeItems(): TreeItem[] {
  const items: TreeItem[] = [];

  let parent: TreeItemId | null = null;
  for (let i = 0; i < DEPTH; i++) {
    items.push({ id: `deep-${i}`, parent, label: `Deep ${i}` });
    parent = `deep-${i}`;
  }

  for (let i = DEPTH; i < TOTAL; i++) {
    items.push({ id: i, parent, label: `Leaf ${i}` });
  }

  return items;
}

function time(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

describe('TreeStore performance', () => {
  it(`handles ${TOTAL} items`, () => {
    const items = buildLargeItems();
    const store = new TreeStore();

    const setItemsMs = time(() => store.setItems(items));
    expect(store.getAll()).toHaveLength(TOTAL);

    const lookups = 100_000;
    const getItemMs = time(() => {
      for (let i = 0; i < lookups; i++) {
        store.getItem((i % (TOTAL - DEPTH)) + DEPTH);
      }
    });

    const getChildrenMs = time(() => {
      for (let i = 0; i < lookups; i++) {
        store.getChildren(i % DEPTH === 0 ? 'deep-0' : DEPTH + (i % (TOTAL - DEPTH)));
      }
    });

    const addItemMs = time(() => {
      for (let i = 0; i < 10_000; i++) {
        store.addItem({ id: `added-${i}`, parent: null });
      }
    });

    const parentsStart = performance.now();
    const parents = store.getAllParents(TOTAL - 1);
    const getAllParentsMs = performance.now() - parentsStart;

    console.log(
      `TreeStore perf (n=${TOTAL}): setItems=${setItemsMs.toFixed(1)}ms, ` +
        `${lookups}×getItem=${getItemMs.toFixed(1)}ms, ` +
        `${lookups}×getChildren=${getChildrenMs.toFixed(1)}ms, ` +
        `10k×addItem=${addItemMs.toFixed(1)}ms, getAllParents=${getAllParentsMs.toFixed(1)}ms`,
    );

    expect(parents).toHaveLength(DEPTH + 1);

    expect(setItemsMs).toBeLessThan(3_000);
    expect(getItemMs).toBeLessThan(1_000);
    expect(getChildrenMs).toBeLessThan(1_000);
    expect(addItemMs).toBeLessThan(1_000);
    expect(getAllParentsMs).toBeLessThan(100);
  });
});
