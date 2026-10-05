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

let client = null;
function db() {
  if (!isConfigured) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).');
  if (!client) client = createClient(url, anonKey);
  return client;
}

async function toUser(authUser) {
  if (!authUser) return null;
  const { data: profile } = await db().from('profiles').select('name,is_admin').eq('id', authUser.id).single();
  return { id: authUser.id, email: authUser.email, name: profile?.name || authUser.user_metadata?.name || '', is_admin: !!profile?.is_admin };
}

const shippingFor = (subtotal) => (subtotal >= 75 ? 0 : 5.95);
const money2 = (n) => Math.round(n * 100) / 100;

export const supabaseBackend = {
  mode: 'cloud',

  async signUp({ name, email, password }) {
    const { data, error } = await db().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) throw new Error(error.message);
    // profiles row is created by the handle_new_user() trigger in schema.sql
    return toUser(data.user);
  },

  async signIn({ email, password }) {
    const { data, error } = await db().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw new Error(error.message);
    return toUser(data.user);
  },

  async signOut() {
    await db().auth.signOut();
  },

  async getSession() {
    const { data } = await db().auth.getSession();
    return toUser(data.session?.user);
  },

  /* ----- catalog ----- */
  async listProducts() {
    const { data, error } = await db().from('products').select('*').order('created_at');
    if (error) throw new Error(error.message);
    return data;
  },
  async upsertProduct(p) {
    const { id, ...rest } = p;
    const query = id
      ? db().from('products').update(rest).eq('id', id)
      : db().from('products').insert(rest);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return this.listProducts();
  },
  async deleteProduct(id) {
    const { error } = await db().from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ----- orders ----- */
  async createOrder({ items, address }) {
    const session = await this.getSession();
    if (!session) throw new Error('Please sign in to place an order.');
    const subtotal = money2(items.reduce((s, i) => s + i.price * i.qty, 0));
    const shipping = shippingFor(subtotal);
    const { data: order, error } = await db().from('orders').insert({
      customer_id: session.id,
      customer_name: session.name,
      email: session.email,
      subtotal, shipping, total: money2(subtotal + shipping),
      address, status: 'pending',
    }).select().single();
    if (error) throw new Error(error.message);
    const { error: itemsError } = await db().from('order_items').insert(
      items.map((i) => ({ order_id: order.id, product_id: i.product_id, name: i.name, price: i.price, qty: i.qty }))
    );
    if (itemsError) throw new Error(itemsError.message);
    return { ...order, number: `SC-${String(order.seq).padStart(4, '0')}`, items };
  },
  async listMyOrders() {
    const session = await this.getSession();
    if (!session) return [];
    const { data, error } = await db().from('orders').select('*, order_items(*)').eq('customer_id', session.id).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((o) => ({ ...o, number: `SC-${String(o.seq).padStart(4, '0')}`, items: o.order_items }));
  },
  async listOrders() {
    await this.requireAdmin();
    const { data, error } = await db().from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((o) => ({ ...o, number: `SC-${String(o.seq).padStart(4, '0')}`, items: o.order_items }));
  },
  async updateOrderStatus(id, status) {
    await this.requireAdmin();
    const { error } = await db().from('orders').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ----- customers (admin) ----- */
  async listCustomers() {
    await this.requireAdmin();
    const { data, error } = await db().from('profiles').select('id,name,email,created_at').eq('is_admin', false).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((c) => ({ ...c, is_admin: false, orders: 0, spent: 0 }));
  },

  async stats() {
    await this.requireAdmin();
    const [{ count: orders }, { count: products }, { count: customers }, { data: rev }] = await Promise.all([
      db().from('orders').select('*', { count: 'exact', head: true }),
      db().from('products').select('*', { count: 'exact', head: true }),
      db().from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', false),
      db().from('orders').select('total').neq('status', 'cancelled'),
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
