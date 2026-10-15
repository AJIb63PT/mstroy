import { defineComponent } from 'vue';

/**
 * Lightweight stand-in for `AgGridVue`. Rendering the real grid in a unit test
 * requires a full layout engine, so the components are tested against this
 * stub which simply exposes the received props.
 */
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
    theme: { type: Object, default: undefined },
  },
  emits: ['grid-ready'],
  template: '<div class="ag-grid-stub" />',
});
