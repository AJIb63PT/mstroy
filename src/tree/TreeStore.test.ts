import { describe, expect, it } from 'vitest';

import { TreeStore } from './TreeStore';
import type { TreeItem } from './types';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
  { id: 5, parent: '91064cef', label: 'Айтем 5' },
  { id: 6, parent: '91064cef', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
];

function createStore(): TreeStore {
  return new TreeStore(items);
}

describe('TreeStore', () => {
  describe('constructor', () => {
    it('builds an empty store when no items are provided', () => {
      expect(new TreeStore().getAll()).toEqual([]);
    });

    it('accepts the initial items', () => {
      expect(createStore().getAll()).toHaveLength(items.length);
    });
  });

  describe('getAll', () => {
    it('returns the full flat array of items', () => {
      const store = createStore();
      expect(store.getAll()).toEqual(items);
    });

    it('does not leak a reference to the constructor argument', () => {
      const source: TreeItem[] = [{ id: 1, parent: null }];
      const store = new TreeStore(source);
      source.push({ id: 2, parent: null });
      expect(store.getAll()).toHaveLength(1);
    });
  });

  describe('getItem', () => {
    it('returns the item by numeric id', () => {
      expect(createStore().getItem(1)?.label).toBe('Айтем 1');
    });

    it('returns the item by string id', () => {
      expect(createStore().getItem('91064cef')?.label).toBe('Айтем 2');
    });

    it('returns undefined for an unknown id', () => {
      expect(createStore().getItem(999)).toBeUndefined();
    });
  });

  describe('getChildren', () => {
    it('returns direct children only', () => {
      const ids = createStore()
        .getChildren(4)
        .map((item) => item.id);
      expect(ids).toEqual([7, 8]);
    });

    it('works for mixed-type parent ids', () => {
      const ids = createStore()
        .getChildren('91064cef')
        .map((item) => item.id);
      expect(ids).toEqual([4, 5, 6]);
    });

    it('returns an empty array for a leaf', () => {
      expect(createStore().getChildren(7)).toEqual([]);
    });

    it('returns an empty array for an unknown id', () => {
      expect(createStore().getChildren(999)).toEqual([]);
    });
  });

  describe('getAllChildren', () => {
    it('returns all descendants of a branch', () => {
      const ids = createStore()
        .getAllChildren('91064cef')
        .map((item) => item.id);
      expect(ids).toEqual([4, 7, 8, 5, 6]);
    });

    it('returns an empty array for a leaf', () => {
      expect(createStore().getAllChildren(7)).toEqual([]);
    });

    it('does not include the item itself', () => {
      const ids = createStore()
        .getAllChildren(1)
        .map((item) => item.id);
      expect(ids).not.toContain(1);
    });
  });

  describe('getAllParents', () => {
    it('returns the chain from the item itself up to the root', () => {
      const ids = createStore()
        .getAllParents(7)
        .map((item) => item.id);
      expect(ids).toEqual([7, 4, '91064cef', 1]);
    });

    it('returns a single element for a root item', () => {
      expect(createStore().getAllParents(1)).toHaveLength(1);
    });

    it('returns an empty array for an unknown id', () => {
      expect(createStore().getAllParents(999)).toEqual([]);
    });
  });

  describe('setItems', () => {
    it('fully replaces the previous content', () => {
      const store = createStore();
      store.setItems([{ id: 42, parent: null, label: 'Новый' }]);
      expect(store.getAll()).toHaveLength(1);
      expect(store.getItem(1)).toBeUndefined();
      expect(store.getItem(42)?.label).toBe('Новый');
    });

    it('rebuilds the children index', () => {
      const store = createStore();
      store.setItems([
        { id: 'a', parent: null },
        { id: 'b', parent: 'a' },
      ]);
      expect(store.getChildren('a').map((item) => item.id)).toEqual(['b']);
    });
  });

  describe('addItem', () => {
    it('adds an item to the flat array and to its parent', () => {
      const store = createStore();
      store.addItem({ id: 9, parent: 1, label: 'Айтем 9' });
      expect(store.getAll()).toHaveLength(items.length + 1);
      expect(store.getItem(9)?.label).toBe('Айтем 9');
      expect(store.getChildren(1).map((item) => item.id)).toContain(9);
    });

    it('adds a root item', () => {
      const store = new TreeStore();
      store.addItem({ id: 'root', parent: null });
      expect(store.getChildren('root')).toEqual([]);
      expect(store.getAll()).toHaveLength(1);
    });
  });

  describe('removeItem', () => {
    it('removes the item and all of its descendants', () => {
      const store = createStore();
      store.removeItem(4);
      expect(store.getItem(4)).toBeUndefined();
      expect(store.getItem(7)).toBeUndefined();
      expect(store.getItem(8)).toBeUndefined();
      expect(store.getAll()).toHaveLength(items.length - 3);
    });

    it('detaches the removed item from its parent', () => {
      const store = createStore();
      store.removeItem(4);
      expect(store.getChildren('91064cef').map((item) => item.id)).toEqual([5, 6]);
    });

    it('ignores an unknown id', () => {
      const store = createStore();
      store.removeItem(999);
      expect(store.getAll()).toHaveLength(items.length);
    });
  });

  describe('updateItem', () => {
    it('updates the fields of an existing item', () => {
      const store = createStore();
      store.updateItem({ id: 5, parent: '91064cef', label: 'Обновлён' });
      expect(store.getItem(5)?.label).toBe('Обновлён');
      expect(store.getAll()).toHaveLength(items.length);
    });

    it('moves the item between parents when parent changes', () => {
      const store = createStore();
      store.updateItem({ id: 5, parent: 1, label: 'Айтем 5' });
      expect(store.getChildren('91064cef').map((item) => item.id)).toEqual([4, 6]);
      expect(store.getChildren(1).map((item) => item.id)).toContain(5);
    });

    it('inserts the item when its id is unknown', () => {
      const store = createStore();
      store.updateItem({ id: 100, parent: 1, label: 'Новый' });
      expect(store.getItem(100)?.label).toBe('Новый');
      expect(store.getChildren(1).map((item) => item.id)).toContain(100);
    });
  });
});
