import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { TreeStore } from '@/tree/TreeStore';
import type { TreeItem } from '@/tree/types';
import ItemsGrid from './ItemsGrid.vue';

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule]);

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
];

function render(loading: boolean) {
  return mount(ItemsGrid, {
    props: { store: new TreeStore(items), version: 1, loading },
    attachTo: document.body,
  });
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

describe('ItemsGrid (real ag-grid)', () => {
  it('renders the columns in the expected order', async () => {
    const wrapper = render(false);
    await settle();

    const text = wrapper.text();
    expect(text.indexOf('No п')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('No п')).toBeLessThan(text.indexOf('Категория'));
    expect(text.indexOf('Категория')).toBeLessThan(text.indexOf('Наименование'));

    wrapper.unmount();
  });

  it('renders every store item on a separate row with a row number', async () => {
    const wrapper = render(false);
    await settle();

    const text = wrapper.text();
    expect(text).toContain('Айтем 1');
    expect(text).toContain('Айтем 2');
    expect(text).toContain('Айтем 3');
    expect(text).toContain('Айтем 4');

    const renderedRows = wrapper.findAll('.ag-row');
    expect(renderedRows.length).toBe(items.length);

    wrapper.unmount();
  });

  it('marks branch rows as "Группа" and leaf rows as "Элемент"', async () => {
    const wrapper = render(false);
    await settle();

    const text = wrapper.text();
    expect(text).toContain('Группа');
    expect(text).toContain('Элемент');

    wrapper.unmount();
  });

  it('shows the loading overlay while data is being fetched', async () => {
    const wrapper = render(true);
    await settle();

    expect(wrapper.text()).toContain('Загрузка данных');

    wrapper.unmount();
  });
});
