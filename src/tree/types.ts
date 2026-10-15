/**
 * Identifier of a tree item. The test data mixes numbers and strings,
 * so the store must support both.
 */
export type TreeItemId = string | number;

/**
 * Single node of the tree. Only `id` and `parent` are meaningful for the
 * hierarchy; every other field is arbitrary and simply carried along.
 */
export interface TreeItem {
  id: TreeItemId;
  parent: TreeItemId | null;
  label?: string;
  [key: string]: unknown;
}
