/**
 * Supabase backend for Socyn Crest (production).
 *
 * Implements the SAME async interface as src/backend/local.js, but backed by
 * Supabase: Postgres tables + Supabase Auth + Row Level Security.
 *
 * Activate by setting (see .env.example):
 *   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 * and running supabase/schema.sql in the Supabase SQL editor.
 *
 * Until those are set, src/backend/index.js keeps using the local demo
 * backend — the storefront works either way.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isConfigured = !!(url && anonKey);

function needConfig() {
  throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).');
}

/* Two clients: a persistent one (localStorage, "remember me") and a
   session-only one (in-memory, cleared when the tab closes). */
const memStore = () => {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = v; },
    removeItem: (k) => { delete m[k]; },
  };
};
let clients = {};
function db(persistent = true) {
  if (!isConfigured) needConfig();
  const key = persistent ? 'persist' : 'session';
  if (!clients[key]) {
    clients[key] = persistent
      ? createClient(url, anonKey)
      : createClient(url, anonKey, { auth: { storage: memStore(), persistSession: true, autoRefreshToken: false } });
  }
  return clients[key];
}

/** The client currently holding a live session (session-only first), else the public anon client. */
async function authed() {
  if (!isConfigured) needConfig();
  for (const persistent of [false, true]) {
    try {
      const { data } = await db(persistent).auth.getSession();
      if (data.session) return db(persistent);
    } catch { /* try the next client */ }
  }
  return db(true);
}

async function toUser(client, authUser) {
  if (!authUser) return null;
  let profile = null;
  try {
    const res = await client.from('profiles').select('name,phone,is_admin').eq('id', authUser.id).single();
    profile = res.data;
  } catch { /* fall back to metadata */ }
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || meta.name || '',
    phone: profile?.phone || meta.phone || '',
    is_admin: !!profile?.is_admin,
  };
}

const shippingFor = (subtotal) => (subtotal >= 75 ? 0 : 5.95);
const money2 = (n) => Math.round(n * 100) / 100;

export const supabaseBackend = {
  mode: 'cloud',

  async signUp({ name, email, phone, password, marketing }) {
    const client = db(true);
    const { data, error } = await client.auth.signUp({
      email: (email || '').trim().toLowerCase(),
      password,
      options: { data: { name: (name || '').trim(), phone: (phone || '').trim(), marketing_opt_in: !!marketing } },
    });
    if (error) throw new Error(error.message);
    // profiles row is created by the handle_new_user() trigger in supabase/schema.sql
    // (run supabase/migration-002-auth-fields.sql for the phone + marketing columns).
    return { user: await toUser(client, data.user), emailConfirmationRequired: !data.session };
  },

  async signIn({ email, password, remember }) {
    const persistent = remember !== false;
    await Promise.allSettled([db(true).auth.signOut(), db(false).auth.signOut()]);
    const client = db(persistent);
    const { data, error } = await client.auth.signInWithPassword({ email: (email || '').trim().toLowerCase(), password });
    if (error) throw new Error(error.message);
    return toUser(client, data.user);
  },

  async signOut() {
    await Promise.allSettled([db(true).auth.signOut(), db(false).auth.signOut()]);
  },

  async getSession() {
    for (const persistent of [false, true]) {
      try {
        const { data } = await db(persistent).auth.getSession();
        if (data.session) return toUser(db(persistent), data.session.user);
      } catch { /* try the next client */ }
    }
    return null;
  },

  async requestPasswordReset(email) {
    const { error } = await db(true).auth.resetPasswordForEmail((email || '').trim().toLowerCase(), {
      redirectTo: `${location.origin}/reset-password/`,
    });
    if (error) throw new Error(error.message);
    return { emailSent: true };
  },

  async updatePassword(password) {
    if (!password || password.length < 8) throw new Error('Your password must be at least 8 characters.');
    const client = await authed();
    const { error } = await client.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    await this.signOut();
    return true;
  },

  /** Calls cb when a password-recovery session is established (reset-password page). */
  onPasswordRecovery(cb) {
    const subs = [db(true), db(false)].map((c) =>
      c.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') cb(); })
    );
    return () => subs.forEach((s) => s.data.subscription.unsubscribe());
  },

  /* ----- catalog ----- */
  async listProducts() {
    const { data, error } = await db().from('products').select('*').order('created_at');
    if (error) throw new Error(error.message);
    return data;
  },
  async upsertProduct(p) {
    const client = await authed();
    const { id, ...rest } = p;
    const query = id
      ? client.from('products').update(rest).eq('id', id)
      : client.from('products').insert(rest);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return this.listProducts();
  },
  async deleteProduct(id) {
    const { error } = await (await authed()).from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ----- orders ----- */
  async createOrder({ items, address }) {
    const client = await authed();
    const { data: { user } } = await client.auth.getUser();
    const session = await toUser(client, user);
    if (!session) throw new Error('Please sign in to place an order.');
    const subtotal = money2(items.reduce((s, i) => s + i.price * i.qty, 0));
    const shipping = shippingFor(subtotal);
    const { data: order, error } = await client.from('orders').insert({
      customer_id: session.id,
      customer_name: session.name,
      email: session.email,
      subtotal, shipping, total: money2(subtotal + shipping),
      address, status: 'pending',
    }).select().single();
    if (error) throw new Error(error.message);
    const { error: itemsError } = await client.from('order_items').insert(
      items.map((i) => ({ order_id: order.id, product_id: i.product_id, name: i.name, price: i.price, qty: i.qty }))
    );
    if (itemsError) throw new Error(itemsError.message);
    return { ...order, number: `SC-${String(order.seq).padStart(4, '0')}`, items };
  },
  async listMyOrders() {
    const client = await authed();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];
    const { data, error } = await client.from('orders').select('*, order_items(*)').eq('customer_id', user.id).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((o) => ({ ...o, number: `SC-${String(o.seq).padStart(4, '0')}`, items: o.order_items }));
  },
  async listOrders() {
    await this.requireAdmin();
    const { data, error } = await (await authed()).from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((o) => ({ ...o, number: `SC-${String(o.seq).padStart(4, '0')}`, items: o.order_items }));
  },
  async updateOrderStatus(id, status) {
    await this.requireAdmin();
    const { error } = await (await authed()).from('orders').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ----- customers (admin) ----- */
  async listCustomers() {
    await this.requireAdmin();
    const { data, error } = await (await authed()).from('profiles').select('id,name,email,phone,created_at').eq('is_admin', false).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((c) => ({ ...c, is_admin: false, orders: 0, spent: 0 }));
  },

  async stats() {
    await this.requireAdmin();
    const client = await authed();
    const [{ count: orders }, { count: products }, { count: customers }, { data: rev }] = await Promise.all([
      client.from('orders').select('*', { count: 'exact', head: true }),
      client.from('products').select('*', { count: 'exact', head: true }),
      client.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', false),
      client.from('orders').select('total').neq('status', 'cancelled'),
    ]);
    return {
      revenue: money2((rev || []).reduce((s, o) => s + Number(o.total), 0)),
      orders: orders || 0, products: products || 0, customers: customers || 0,
    };
  },

  async requireAdmin() {
    const s = await this.getSession();
    if (!s || !s.is_admin) throw new Error('Admin access required.');
    return s;
  },
};
