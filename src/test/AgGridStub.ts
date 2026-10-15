import { defineComponent } from 'vue';

export const AgGridStub = defineComponent({
  name: 'AgGridVue',
  props: {
    columnDefs: { type: Array, default: undefined },
    defaultColDef: { type: Object, default: undefined },
    autoGroupColumnDef: { type: Object, default: undefined },
    rowData: { type: Array, default: undefined },
    treeData: { type: Boolean, default: undefined },
    getDataPath: { type: Function, default: undefined },
    groupDefaultExpanded: { type: Number, default: undefined },
    loading: { type: Boolean, default: undefined },
    overlayLoadingTemplate: { type: String, default: undefined },
    overlayNoRowsTemplate: { type: String, default: undefined },
    theme: { type: Object, default: undefined },
  },
  emits: ['grid-ready'],
  template: '<div class="ag-grid-stub" />',
});
