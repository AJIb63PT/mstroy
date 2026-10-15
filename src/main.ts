import { createApp } from 'vue';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import App from './App.vue';
import './style.css';

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule]);

createApp(App).mount('#app');
