/**
 * Data layer for Socyn Crest.
 *
 * TODAY: reads from the local `src/config.js` catalog. Everything in the UI
 * goes through this module — never import config.js directly in views.
 *
 * TOMORROW (full e-commerce): swap these functions for fetch() calls against
 * the backend (products, inventory, orders, customers). The view code won't
 * need to change — only this file does. See README "Roadmap" for the plan.
 */
import { business, products as localProducts } from './config.js';

export { business };

export const api = {
  /** All products. Future: GET /api/products */
  getProducts() {
    return localProducts;
  },

  /** One product by id. Future: GET /api/products/:id */
  getProduct(id) {
    return localProducts.find((p) => p.id === id);
  },

  /** Distinct categories, in display order. Future: derived from backend. */
  getCategories() {
    return ['Men', 'Women', 'Outerwear'];
  },

  // --- Reserved for the full store build (do not call yet) ---
  // createCheckoutSession(bag) -> POST /api/checkout
  // getOrders(token)           -> GET  /api/orders
  // adminLogin(email, pass)    -> POST /api/admin/login
};
