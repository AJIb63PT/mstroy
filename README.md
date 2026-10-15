# MStroy · TreeStore + AG Grid

Тестовое задание: хранилище-дерево `TreeStore` на TypeScript и Vue 3‑компонент,
который выводит его элементы в таблицу на основе AG Grid (tree data).

## Возможности

- **`TreeStore`** на TypeScript без зависимостей от фреймворка — пригоден для
  изолированного импорта и unit-тестирования. Индексированные (`Map`) lookups
  без повторного обхода массива.
- **Vue 3 + TypeScript** (`<script setup>`).
- **AG Grid** (`ag-grid-vue3` + `ag-grid-enterprise`) с режимом `treeData`:
  разворачиваемые строки, колонки `No п\п`, `Наименование`, `Категория`
  (`Группа` / `Элемент`).
- Загрузка `items.json` через `fetch` в рантайме с искусственной задержкой
  **2 секунды**, индикатором загрузки и реактивным обновлением таблицы.
- Unit-, компонентные и performance-тесты (**Vitest**).

## Стек

| Область       | Технологии                                  |
| ------------- | ------------------------------------------- |
| UI            | Vue 3, TypeScript                           |
| Таблица       | AG Grid Community + Enterprise (`treeData`) |
| Сборка        | Vite                                        |
| Тесты         | Vitest, @vue/test-utils, happy-dom          |
| Качество кода | ESLint, Prettier, vue-tsc                   |

## Запуск

```bash
npm install        # установка зависимостей
npm run dev        # dev-сервер (http://localhost:5173)
npm run build      # production-сборка
npm run preview    # предпросмотр сборки
npm run test       # тесты
npm run test:coverage
npm run typecheck  # проверка типов
npm run lint       # ESLint + Prettier
```

## Структура

```
public/items.json              # данные, загружаемые через fetch
src/
  api/itemsApi.ts              # fetch + искусственная задержка 2с
  components/ItemsGrid.vue     # Vue-компонент таблицы на AG Grid
  grid/treeGrid.ts             # колонки, autoGroupColumnDef, getDataPath
  tree/TreeStore.ts            # класс-хранилище
  tree/types.ts                # TreeItem / TreeItemId
  App.vue                      # загрузка данных и состояние loading
  main.ts                      # регистрация модулей AG Grid
```

## Класс `TreeStore`

Конструктор принимает массив элементов, поля `id` (`number | string`) и
`parent` (`id | null`) задают иерархию; остальные поля произвольны.

| Метод                | Описание                                              | Сложность |
| -------------------- | ----------------------------------------------------- | --------- |
| `getAll()`           | Полный плоский массив элементов                       | O(1)      |
| `getItem(id)`        | Элемент по `id`                                       | O(1)      |
| `getChildren(id)`    | Прямые дочерние элементы (пустой массив, если их нет) | O(1)      |
| `getAllChildren(id)` | Все потомки на любую глубину                          | O(k)      |
| `getAllParents(id)`  | Цепочка `[элемент, …, корень]` (порядок важен)        | O(d)      |
| `setItems(items)`    | Полная замена содержимого                             | O(n)      |
| `addItem(item)`      | Добавление элемента                                   | O(1)\*    |
| `updateItem(item)`   | Обновление элемента (в т.ч. смена родителя)           | O(1)      |
| `removeItem(id)`     | Удаление элемента и всех потомков                     | O(n)      |

\* амортизированно. `k` — размер поддерева, `d` — глубина элемента.

Внутри хранятся три структуры: плоский массив `items`, `Map` `id → индекс` и
`Map` `parentId → дети`. Это даёт O(1) на «горячих» операциях чтения и не
требует пересбора индексов при добавлении/обновлении.

## Производительность

Замеры performance-теста на 200 000 элементах (глубина 1000):

```
TreeStore perf (n=200000):
  setItems=~30ms,
  100000×getItem=~8ms,
  100000×getChildren=~2ms,
  10000×addItem=~4ms,
  getAllParents=~1ms
```

## Порядок в таблице

Колонка `No п\п` закреплена слева (`pinned: 'left'`), поэтому автоматически
генерируемая AG Grid колонка-дерево отображается после неё, давая порядок
`No п\п | Наименование | Категория`.
