<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import ItemsGrid from '@/components/ItemsGrid.vue';
import { fetchItems } from '@/api/itemsApi';
import { TreeStore } from '@/tree/TreeStore';
import type { TreeItem } from '@/tree/types';

const store = new TreeStore();
const version = ref(0);
const isLoading = ref(true);

const controller = new AbortController();

onMounted(async () => {
  const items: TreeItem[] = await fetchItems(controller.signal);
  store.setItems(items);
  version.value += 1;
  isLoading.value = false;
});

onBeforeUnmount(() => controller.abort());
</script>

<template>
  <main class="app">
    <h1 class="app__title">MStroy · TreeStore</h1>
    <ItemsGrid :store="store" :version="version" :loading="isLoading" />
  </main>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  box-sizing: border-box;
  padding: 24px;
}

.app__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
</style>
