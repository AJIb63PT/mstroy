<script setup lang="ts">
import { computed, ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeQuartz } from 'ag-grid-community';
import type { ColDef, GetDataPath, GridApi, GridReadyEvent } from 'ag-grid-community';

import type { TreeStore } from '@/tree/TreeStore';
import type { TreeItem } from '@/tree/types';
import { createAutoGroupColumnDef, createColumnDefs, createGetDataPath } from '@/grid/treeGrid';

const props = defineProps<{
  /** Storage whose items are rendered as table rows. */
  store: TreeStore;
  /** Bumped by the owner whenever the store content changes. */
  version: number;
  /** Whether the data is still being fetched. */
  loading: boolean;
}>();

const theme = themeQuartz;

const defaultColDef: ColDef<TreeItem> = {
  resizable: true,
  sortable: false,
  suppressHeaderMenuButton: true,
};

const columnDefs = computed<ColDef<TreeItem>[]>(() => createColumnDefs(props.store));
const autoGroupColumnDef = createAutoGroupColumnDef();
const getDataPath = computed<GetDataPath<TreeItem>>(() => createGetDataPath(props.store));

const rowData = computed<TreeItem[]>(() => {
  void props.version;
  return props.store.getAll().slice();
});

const overlayLoadingTemplate =
  '<span class="grid-loading"><span class="grid-loading__spinner"></span>Загрузка данных…</span>';

const gridApi = ref<GridApi<TreeItem> | null>(null);

function onGridReady(event: GridReadyEvent<TreeItem>): void {
  gridApi.value = event.api;
}

defineExpose({ gridApi });
</script>

<template>
  <div class="grid-wrapper">
    <AgGridVue
      class="grid"
      :theme="theme"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :auto-group-column-def="autoGroupColumnDef"
      :row-data="rowData"
      :tree-data="true"
      :get-data-path="getDataPath"
      :group-default-expanded="-1"
      :loading="loading"
      :overlay-loading-template="overlayLoadingTemplate"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<style scoped>
.grid-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.grid {
  width: 100%;
  height: 100%;
}
</style>
