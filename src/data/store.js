const tenants = [
  { id: 't1', name: 'Bakmi Effata', open: true },
  { id: 't2', name: 'Oriental Chicken Rice', open: true },
  { id: 't3', name: 'Cerita Cinta', open: false }
];

const menus = [
  { id: 'm1', tenantId: 't1', name: 'Bakmi Ayam', price: 18000, available: true },
  { id: 'm2', tenantId: 't1', name: 'Bakmi Pangsit', price: 20000, available: true },
  { id: 'm3', tenantId: 't2', name: 'Chicken Rice', price: 22000, available: true },
  { id: 'm4', tenantId: 't3', name: 'Nasi Ayam Geprek', price: 20000, available: false }
];

const orders = [];
const payments = [];
const feedback = [];

module.exports = { tenants, menus, orders, payments, feedback };
