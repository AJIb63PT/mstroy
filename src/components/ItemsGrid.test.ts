import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { GetDataPath } from 'ag-grid-community';

import { TreeStore } from '@/tree/TreeStore';
import type { TreeItem } from '@/tree/types';
import { AgGridStub } from '@/test/AgGridStub';
import ItemsGrid from './ItemsGrid.vue';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
];

function mountGrid(store: TreeStore, version = 0, loading = false) {
  return mount(ItemsGrid, {
    props: { store, version, loading },
    global: { stubs: { AgGridVue: AgGridStub } },
  });
}

describe('ItemsGrid', () => {
  it('enables AG Grid tree data', () => {
    const grid = mountGrid(new TreeStore(items)).findComponent(AgGridStub);
    expect(grid.props('treeData')).toBe(true);
  });

  it('renders the store items as rows', () => {
    const grid = mountGrid(new TreeStore(items)).findComponent(AgGridStub);
    expect(grid.props('rowData')).toHaveLength(items.length);
  });

  it('exposes the row number and name columns', () => {
    const grid = mountGrid(new TreeStore(items)).findComponent(AgGridStub);
    expect((grid.props('columnDefs') as unknown[]).length).toBe(2);
  });

  it('passes the loading state to the grid', () => {
    const grid = mountGrid(new TreeStore(), 0, true).findComponent(AgGridStub);
    expect(grid.props('loading')).toBe(true);
  });

  it('shows an error overlay with the escaped message', async () => {
    const wrapper = mount(ItemsGrid, {
      props: { store: new TreeStore(), version: 0, loading: false, error: 'bad <tag> & "quotes"' },
      global: { stubs: { AgGridVue: AgGridStub } },
    });
    const template = wrapper.findComponent(AgGridStub).props('overlayNoRowsTemplate') as string;

    expect(template).toContain('Ошибка загрузки данных');
    expect(template).toContain('bad &lt;tag&gt; &amp; &quot;quotes&quot;');
  });

  it('computes the tree path from the store', () => {
    const store = new TreeStore(items);
    const grid = mountGrid(store).findComponent(AgGridStub);
    const getDataPath = grid.props('getDataPath') as GetDataPath<TreeItem>;
    expect(getDataPath(store.getItem(4) as TreeItem)).toEqual(['1', '91064cef', '4']);
  });

  it('reacts to new data pushed into the store via setItems', async () => {
    const store = new TreeStore();
    const wrapper = mountGrid(store);
    const grid = wrapper.findComponent(AgGridStub);
    expect(grid.props('rowData')).toHaveLength(0);

    store.setItems(items);
    await wrapper.setProps({ version: 1, loading: false });

    expect(grid.props('rowData')).toHaveLength(items.length);
    expect(grid.props('loading')).toBe(false);
  });
});
