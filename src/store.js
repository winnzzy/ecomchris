/**
 * Cart store for Socyn Crest.
 *
 * A tiny observable store: views subscribe, actions update, state persists
 * to localStorage. When user accounts land, the persistence layer here is
 * where a server-side cart sync will plug in (see api.js roadmap).
 */
import { api } from './api.js';

const STORAGE_KEY = 'socyncrest-bag';
const MAX_QTY = 99;

const sanitize = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const valid = new Set(api.getProducts().map((p) => p.id));
  return Object.fromEntries(
    Object.entries(value).filter(
      ([id, n]) => valid.has(id) && Number.isInteger(n) && n > 0 && n <= MAX_QTY
    )
  );
};

const load = () => {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch {
    return {};
  }
};

let items = load();
let storageAvailable = true;
const listeners = new Set();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    storageAvailable = false;
  }
};

const emit = () => listeners.forEach((fn) => fn(items));

export const cart = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getItems() {
    return { ...items };
  },
  entries() {
    return Object.entries(items)
      .map(([id, qty]) => ({ product: api.getProduct(id), qty }))
      .filter((e) => e.product && e.qty > 0);
  },
  count() {
    return Object.values(items).reduce((a, b) => a + b, 0);
  },
  subtotal() {
    return this.entries().reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  },
  add(id, qty = 1) {
    if (!api.getProduct(id)) return false;
    items[id] = Math.min(MAX_QTY, (items[id] || 0) + qty);
    persist();
    emit();
    return storageAvailable;
  },
  setQty(id, qty) {
    if (!api.getProduct(id)) return;
    items[id] = Math.min(MAX_QTY, Math.max(0, qty | 0));
    if (items[id] === 0) delete items[id];
    persist();
    emit();
  },
  clear() {
    items = {};
    persist();
    emit();
  },
};
