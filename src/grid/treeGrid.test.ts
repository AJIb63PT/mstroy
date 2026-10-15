import { describe, expect, it } from 'vitest';
import type { ValueGetterParams } from 'ag-grid-community';

import { TreeStore } from '@/tree/TreeStore';
import type { TreeItem } from '@/tree/types';
import {
  CATEGORY_GROUP,
  CATEGORY_ITEM,
  createAutoGroupColumnDef,
  createColumnDefs,
  createGetDataPath,
  getCategory,
} from './treeGrid';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
];

const store = new TreeStore(items);

function valueGetterParams(data: TreeItem, rowIndex: number): ValueGetterParams<TreeItem> {
  return { data, node: { rowIndex } } as unknown as ValueGetterParams<TreeItem>;
}

describe('getCategory', () => {
  it('returns "Группа" when the item has children', () => {
    expect(getCategory(store, store.getItem(1) as TreeItem)).toBe(CATEGORY_GROUP);
  });

  it('returns "Элемент" for a leaf', () => {
    expect(getCategory(store, store.getItem(3) as TreeItem)).toBe(CATEGORY_ITEM);
  });
});

describe('createColumnDefs', () => {
  const columnDefs = createColumnDefs();

  it('defines the row number and name columns', () => {
    expect(columnDefs.map((def) => def.colId)).toEqual(['rowNumber', 'name']);
  });

  it('renders a 1-based row number', () => {
    const rowNumber = columnDefs[0];
    const getter = rowNumber.valueGetter as (params: ValueGetterParams<TreeItem>) => unknown;
    expect(getter(valueGetterParams(store.getAll()[0], 0))).toBe(1);
    expect(getter(valueGetterParams(store.getAll()[1], 1))).toBe(2);
  });

  it('shows the item label in the name column', () => {
    expect(columnDefs[1].field).toBe('label');
  });
});

describe('createAutoGroupColumnDef', () => {
  it('is titled "Категория" and hides the descendant count', () => {
    const autoGroup = createAutoGroupColumnDef(store);
    expect(autoGroup.headerName).toBe('Категория');
    expect(autoGroup.cellRendererParams).toEqual({ suppressCount: true });
  });

  it('resolves the category through the store', () => {
    const getter = createAutoGroupColumnDef(store).valueGetter as (
      params: ValueGetterParams<TreeItem>,
    ) => unknown;
    expect(getter(valueGetterParams(store.getItem(1) as TreeItem, 0))).toBe(CATEGORY_GROUP);
    expect(getter(valueGetterParams(store.getItem(3) as TreeItem, 2))).toBe(CATEGORY_ITEM);
  });
});

describe('createGetDataPath', () => {
  const getDataPath = createGetDataPath(store);

  it('returns the ids from the root down to the item', () => {
    expect(getDataPath(store.getItem(4) as TreeItem)).toEqual(['1', '91064cef', '4']);
  });

  it('returns a single id for a root item', () => {
    expect(getDataPath(store.getItem(1) as TreeItem)).toEqual(['1']);
  });
});
