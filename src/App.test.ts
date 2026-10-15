import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import type { TreeItem } from '@/tree/types';
import { AgGridStub } from '@/test/AgGridStub';
import App from './App.vue';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
];

vi.mock('@/api/itemsApi', () => ({
  LOAD_DELAY_MS: 0,
  fetchItems: vi.fn(() => Promise.resolve(items)),
}));

describe('App', () => {
  it('shows the loading state first and then the loaded rows', async () => {
    const wrapper = mount(App, { global: { stubs: { AgGridVue: AgGridStub } } });
    const grid = wrapper.findComponent(AgGridStub);

    expect(grid.props('loading')).toBe(true);
    expect(grid.props('rowData')).toHaveLength(0);

    await flushPromises();

    expect(grid.props('loading')).toBe(false);
    expect(grid.props('rowData')).toHaveLength(items.length);
  });
});
