/**
 * Local demo backend for Socyn Crest.
 *
 * Implements the full store interface (auth, catalog, orders, customers)
 * on top of localStorage so signup, login, checkout, and the admin panel
 * all work end-to-end TODAY with zero infrastructure.
 *
 * DEMO-GRADE security: passwords are SHA-256 hashed (never plaintext), but
 * this is still browser storage — NOT production security. Production uses
 * src/backend/supabase.js (Supabase Auth + Row Level Security).
 *
 * Swap point: src/backend/index.js selects this or the Supabase backend.
 * Both implement the same async interface documented below.
 */
import { products as seedCatalog, shippingFor } from '../config.js';

const K = {
  users: 'sc_users',
  session: 'sc_session',
  sessionTmp: 'sc_session_tmp', // "remember me" off -> sessionStorage only
  products: 'sc_products',
  orders: 'sc_orders',
  seeded: 'sc_seeded_v1',
};

const read = (k, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/* Session lives in localStorage ("remember me") or sessionStorage (this tab only). */
const readSessionId = () => {
  try {
    const tmp = sessionStorage.getItem(K.sessionTmp);
    if (tmp) return JSON.parse(tmp);
  } catch { /* ignore */ }
  return read(K.session, null);
};
const writeSessionId = (id, remember) => {
  try { sessionStorage.removeItem(K.sessionTmp); } catch { /* ignore */ }
  try { localStorage.removeItem(K.session); } catch { /* ignore */ }
  if (id == null) return;
  if (remember === false) {
    try { sessionStorage.setItem(K.sessionTmp, JSON.stringify(id)); } catch { /* ignore */ }
  } else {
    write(K.session, id);
  }
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`socyn-crest:${str}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const money2 = (n) => Math.round(n * 100) / 100;

/* ---------------- seed data ---------------- */
async function seed() {
  if (read(K.seeded, false)) return;
  const adminHash = await sha256('Crest2026!');
  const custHash = await sha256('demo1234');
  const users = [
    { id: uid('u'), name: 'Store Admin', email: 'admin@socyncrest.com', passwordHash: adminHash, is_admin: true, created_at: new Date().toISOString() },
    { id: uid('u'), name: 'Amara Okafor', email: 'amara@example.com', passwordHash: custHash, is_admin: false, created_at: new Date().toISOString() },
    { id: uid('u'), name: 'Daniel Reyes', email: 'daniel@example.com', passwordHash: custHash, is_admin: false, created_at: new Date().toISOString() },
    { id: uid('u'), name: 'Priya Nair', email: 'priya@example.com', passwordHash: custHash, is_admin: false, created_at: new Date().toISOString() },
  ];
  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));
  const prod = (id, qty) => {
    const p = seedCatalog.find((x) => x.id === id);
    return { product_id: id, name: p.name, price: p.price, qty };
  };
  const mkOrder = (num, email, items, status, daysAgo, street = '123 Demo Street') => {
    const subtotal = money2(items.reduce((s, i) => s + i.price * i.qty, 0));
    const shipping = shippingFor(subtotal);
    const u = byEmail[email];
    return {
      id: uid('o'), number: num, customer_id: u.id, customer_name: u.name, email,
      items, subtotal, shipping, total: money2(subtotal + shipping),
      address: { name: u.name, street, city: 'Austin', state: 'TX', zip: '78701', phone: '' },
      status, created_at: new Date(Date.now() - daysAgo * 864e5).toISOString(),
    };
  };
  const orders = [
    mkOrder('SC-1001', 'amara@example.com', [prod('essential-tee', 2), prod('cloud-hoodie', 1)], 'delivered', 12),
    mkOrder('SC-1002', 'daniel@example.com', [prod('scarlet-dress', 1)], 'shipped', 5, '48 Palm Avenue'),
    mkOrder('SC-1003', 'amara@example.com', [prod('blush-joggers', 1)], 'processing', 2),
    mkOrder('SC-1004', 'priya@example.com', [prod('rust-bomber', 1)], 'pending', 0.25, '9 Lakeview Drive'),
  ];
  write(K.users, users);
  write(K.products, seedCatalog.map((p) => ({ ...p, stock: 50, active: true })));
  write(K.orders, orders);
  write(K.seeded, true);
}

const publicUser = (u) => (u ? { id: u.id, name: u.name, email: u.email, phone: u.phone || '', is_admin: !!u.is_admin } : null);

/* ---------------- interface ---------------- */
export const localBackend = {
  mode: 'demo',

  async signUp({ name, email, phone, password, marketing }) {
    await seed();
    email = (email || '').trim().toLowerCase();
    phone = (phone || '').trim();
    if (!name?.trim()) throw new Error('Please enter your full name.');
    if (!emailOk(email)) throw new Error('Please enter a valid email address.');
    if (!password || password.length < 8) throw new Error('Your password must be at least 8 characters.');
    const users = read(K.users, []);
    if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists. Try signing in instead.');
    const user = {
      id: uid('u'), name: name.trim(), email, phone,
      marketingOptIn: !!marketing,
      passwordHash: await sha256(password), is_admin: false,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    write(K.users, users);
    writeSessionId(user.id, true);
    return { user: publicUser(user), emailConfirmationRequired: false };
  },

  async signIn({ email, password, remember }) {
    await seed();
    email = (email || '').trim().toLowerCase();
    const users = read(K.users, []);
    const user = users.find((u) => u.email === email);
    if (!user || user.passwordHash !== (await sha256(password))) throw new Error('Incorrect email or password.');
    writeSessionId(user.id, remember !== false);
    return publicUser(user);
  },

  async signOut() {
    writeSessionId(null);
  },

  async getSession() {
    await seed();
    const id = readSessionId();
    if (!id) return null;
    const user = read(K.users, []).find((u) => u.id === id);
    return publicUser(user);
  },

  /** Demo mode cannot send email — the UI explains this. Kept for interface parity. */
  async requestPasswordReset() {
    await seed();
    return { emailSent: false };
  },

  async updatePassword(password) {
    await seed();
    if (!password || password.length < 8) throw new Error('Your password must be at least 8 characters.');
    const id = readSessionId();
    const users = read(K.users, []);
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('This reset link is invalid or has expired.');
    user.passwordHash = await sha256(password);
    write(K.users, users);
    return true;
  },

  /* ----- catalog (admin-managed copy) ----- */
  async listProducts() {
    await seed();
    return read(K.products, []);
  },
  async upsertProduct(p) {
    await seed();
    const products = read(K.products, []);
    if (p.id) {
      const i = products.findIndex((x) => x.id === p.id);
      if (i >= 0) products[i] = { ...products[i], ...p };
      else products.push({ id: uid('p'), stock: 0, active: true, ...p });
    } else {
      products.push({ id: uid('p'), stock: 0, active: true, ...p });
    }
    write(K.products, products);
    return products;
  },
  async deleteProduct(id) {
    await seed();
    write(K.products, read(K.products, []).filter((p) => p.id !== id));
  },

  /* ----- orders ----- */
  async createOrder({ items, address, shippingMethod }) {
    await seed();
    const session = await this.getSession();
    if (!session) throw new Error('Please sign in to place an order.');
    const method = shippingMethod === 'express' ? 'express' : 'standard';
    const subtotal = money2(items.reduce((s, i) => s + i.price * i.qty, 0));
    const shipping = shippingFor(subtotal, method);
    const orders = read(K.orders, []);
    const number = `SC-${1001 + orders.length}`;
    const order = {
      id: uid('o'), number, customer_id: session.id, customer_name: session.name, email: session.email,
      items, subtotal, shipping, shipping_method: method, total: money2(subtotal + shipping),
      address, status: 'pending', created_at: new Date().toISOString(),
    };
    orders.unshift(order);
    write(K.orders, orders);
    return order;
  },
  /** Demo backend has no email service — order receipts need the Resend edge function. */
  async sendOrderEmail() { return; },
  async listMyOrders() {
    const session = await this.getSession();
    if (!session) return [];
    await seed();
    return read(K.orders, []).filter((o) => o.customer_id === session.id);
  },
  async listOrders() {
    await this.requireAdmin();
    await seed();
    return read(K.orders, []);
  },
  async updateOrderStatus(id, status) {
    await this.requireAdmin();
    const orders = read(K.orders, []);
    const o = orders.find((x) => x.id === id);
    if (!o) throw new Error('Order not found.');
    o.status = status;
    write(K.orders, orders);
    return o;
  },

  /* ----- customers (admin) ----- */
  async listCustomers() {
    await this.requireAdmin();
    await seed();
    const orders = read(K.orders, []);
    return read(K.users, [])
      .filter((u) => !u.is_admin)
      .map((u) => {
        const mine = orders.filter((o) => o.customer_id === u.id);
        return { ...publicUser(u), orders: mine.length, spent: money2(mine.reduce((s, o) => s + o.total, 0)), created_at: u.created_at };
      });
  },

  async stats() {
    await this.requireAdmin();
    await seed();
    const orders = read(K.orders, []);
    const products = read(K.products, []);
    const customers = read(K.users, []).filter((u) => !u.is_admin).length;
    return {
      revenue: money2(orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)),
      orders: orders.length,
      products: products.length,
      customers,
    };
  },

  async requireAdmin() {
    const s = await this.getSession();
    if (!s || !s.is_admin) throw new Error('Admin access required.');
    return s;
  },
};
