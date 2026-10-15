import type { TreeItem, TreeItemId } from './types';

/** Shared immutable instance returned by `getChildren` for leaf nodes. */
const EMPTY_CHILDREN: TreeItem[] = [];

/**
 * In-memory tree storage optimised for frequent lookups.
 *
 * Instead of re-scanning the flat `items` array on every call, the store keeps
 * three cheap-to-maintain indexes next to it:
 *
 * - `items` – the flat array returned by {@link getAll}. Kept for O(1) reads.
 * - `indexById` – `id -> position in items`, makes {@link getItem} and
 *   {@link updateItem} O(1).
 * - `childrenByParentId` – `parentId -> direct children`, makes
 *   {@link getChildren} O(1).
 *
 * Because of these indexes the hot lookups never iterate the whole array:
 *
 * | method           | complexity              |
 * | ---------------- | ----------------------- |
 * | getItem          | O(1)                    |
 * | getChildren      | O(1)                    |
 * | getAllChildren   | O(k), k = subtree size  |
 * | getAllParents    | O(d), d = depth         |
 * | setItems         | O(n)                    |
 * | addItem          | O(1) amortised          |
 * | updateItem       | O(1) (+ O(children))    |
 * | removeItem       | O(n)                    |
 */
export class TreeStore {
  private items: TreeItem[] = [];
  private readonly indexById = new Map<TreeItemId, number>();
  private readonly childrenByParentId = new Map<TreeItemId, TreeItem[]>();

  constructor(items: TreeItem[] = []) {
    this.setItems(items);
  }

  /** Returns the full flat array of stored items. */
  getAll(): TreeItem[] {
    return this.items;
  }

  /** Returns the item with the given `id` or `undefined` when absent. */
  getItem(id: TreeItemId): TreeItem | undefined {
    const index = this.indexById.get(id);
    return index === undefined ? undefined : this.items[index];
  }

  /**
   * Returns the direct children of the item with the given `id`.
   * The returned array is the live internal collection (never mutated by
   * external code) or an empty array for leaves / unknown ids.
   */
  getChildren(id: TreeItemId): TreeItem[] {
    return this.childrenByParentId.get(id) ?? EMPTY_CHILDREN;
  }

  /**
   * Returns every descendant of the item with the given `id` (children of
   * children and so on). Pre-order traversal, O(k) where `k` is the size of
   * the subtree.
   */
  getAllChildren(id: TreeItemId): TreeItem[] {
    const result: TreeItem[] = [];
    const children = this.childrenByParentId.get(id);
    if (children === undefined) {
      return result;
    }

    const stack: TreeItem[] = [];
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }

    while (stack.length > 0) {
      const node = stack.pop() as TreeItem;
      result.push(node);

      const grandChildren = this.childrenByParentId.get(node.id);
      if (grandChildren !== undefined) {
        for (let i = grandChildren.length - 1; i >= 0; i--) {
          stack.push(grandChildren[i]);
        }
      }
    }

    return result;
  }

  /**
   * Returns the chain of ancestors starting from the item itself and walking
   * up to the root. The order is relevant: `[self, parent, ..., root]`.
   * O(d) where `d` is the depth of the item.
   */
  getAllParents(id: TreeItemId): TreeItem[] {
    const result: TreeItem[] = [];

    let current = this.getItem(id);
    while (current !== undefined) {
      result.push(current);

      const parent = current.parent;
      if (parent === null) {
        break;
      }
      current = this.getItem(parent);
    }

    return result;
  }

  /** Replaces the whole content of the store with the given items. O(n). */
  setItems(items: TreeItem[]): void {
    this.items = items.slice();
    this.indexById.clear();
    this.childrenByParentId.clear();

    const { items: ownItems, indexById, childrenByParentId } = this;

    for (let i = 0; i < ownItems.length; i++) {
      const item = ownItems[i];
      indexById.set(item.id, i);

      const parent = item.parent;
      if (parent === null) {
        continue;
      }

      const siblings = childrenByParentId.get(parent);
      if (siblings === undefined) {
        childrenByParentId.set(parent, [item]);
      } else {
        siblings.push(item);
      }
    }
  }

  /** Adds a new item to the store. O(1) amortised. */
  addItem(item: TreeItem): void {
    if (this.indexById.has(item.id)) {
      this.removeItem(item.id);
    }

    this.indexById.set(item.id, this.items.length);
    this.items.push(item);

    const parent = item.parent;
    if (parent !== null) {
      const siblings = this.childrenByParentId.get(parent);
      if (siblings === undefined) {
        this.childrenByParentId.set(parent, [item]);
      } else {
        siblings.push(item);
      }
    }
  }

  /**
   * Updates an existing item in place (or inserts it when the id is unknown).
   * Reparenting is handled by moving the item between the sibling lists. O(1).
   */
  updateItem(item: TreeItem): void {
    const index = this.indexById.get(item.id);
    if (index === undefined) {
      this.addItem(item);
      return;
    }

    const previous = this.items[index];
    if (previous.parent !== item.parent) {
      if (previous.parent !== null) {
        this.detachChild(previous.parent, previous);
      }
      if (item.parent !== null) {
        this.attachChild(item.parent, item);
      }
    }

    this.items[index] = item;
  }

  /** Removes the item with the given `id` along with all of its descendants. O(n). */
  removeItem(id: TreeItemId): void {
    if (!this.indexById.has(id)) {
      return;
    }

    const removedIds = new Set<TreeItemId>([id]);
    const subtree = this.getAllChildren(id);
    for (let i = 0; i < subtree.length; i++) {
      removedIds.add(subtree[i].id);
    }

    const target = this.items[this.indexById.get(id) as number];
    if (target.parent !== null) {
      this.detachChild(target.parent, target);
    }

    for (const removedId of removedIds) {
      this.childrenByParentId.delete(removedId);
    }

    const kept: TreeItem[] = [];
    this.indexById.clear();
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (removedIds.has(item.id)) {
        continue;
      }
      this.indexById.set(item.id, kept.length);
      kept.push(item);
    }
    this.items = kept;
  }

  private attachChild(parentId: TreeItemId, item: TreeItem): void {
    const siblings = this.childrenByParentId.get(parentId);
    if (siblings === undefined) {
      this.childrenByParentId.set(parentId, [item]);
    } else {
      siblings.push(item);
    }
  }

  private detachChild(parentId: TreeItemId, item: TreeItem): void {
    const siblings = this.childrenByParentId.get(parentId);
    if (siblings === undefined) {
      return;
    }

    const index = siblings.indexOf(item);
    if (index !== -1) {
      siblings.splice(index, 1);
    }
    if (siblings.length === 0) {
      this.childrenByParentId.delete(parentId);
    }
  }
}
