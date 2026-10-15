import type { AutoGroupColumnDef, ColDef, GetDataPath } from 'ag-grid-community';

import type { TreeStore } from '@/tree/TreeStore';
import type { TreeItem } from '@/tree/types';

export const CATEGORY_GROUP = 'Группа';
export const CATEGORY_ITEM = 'Элемент';

export function getCategory(store: TreeStore, item: TreeItem): string {
  return store.getChildren(item.id).length > 0 ? CATEGORY_GROUP : CATEGORY_ITEM;
}

export function createColumnDefs(): ColDef<TreeItem>[] {
  return [
    {
      headerName: 'No п\\п',
      colId: 'rowNumber',
      width: 110,
      pinned: 'left',
      sortable: false,
      filter: false,
      valueGetter: (params) => {
        const rowIndex = params.node?.rowIndex ?? null;
        return rowIndex === null ? '' : rowIndex + 1;
      },
    },
    {
      headerName: 'Наименование',
      colId: 'name',
      field: 'label',
      width: 240,
      sortable: false,
      filter: false,
    },
  ];
}

export function createAutoGroupColumnDef(store: TreeStore): AutoGroupColumnDef<TreeItem> {
  return {
    headerName: 'Категория',
    valueGetter: (params) => (params.data ? getCategory(store, params.data) : ''),
    flex: 1,
    minWidth: 240,
    cellRendererParams: {
      suppressCount: true,
    },
  };
}

export function createGetDataPath(store: TreeStore): GetDataPath<TreeItem> {
  return (data) => {
    const path = store.getAllParents(data.id);
    const ids: string[] = new Array<string>(path.length);
    for (let i = path.length - 1, j = 0; i >= 0; i--, j++) {
      ids[j] = String(path[i].id);
    }
    return ids;
  };
}
