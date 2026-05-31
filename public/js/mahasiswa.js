const { api, rupiah, $ } = window.Eatsy;
const cart = [];

async function loadTenants() {
  const tenants = await api('/api/tenants');
  $('tenants').innerHTML = '';
  for (const t of tenants) {
    const div = document.createElement('div');
    div.className = 'card' + (t.open ? '' : ' disabled');
    div.innerHTML = `<strong>${t.name}</strong><br/><small>${t.open ? '✅ Buka' : '❌ Tutup'}</small>`;
    if (t.open) div.onclick = () => loadMenus(t.id, t.name);
    $('tenants').appendChild(div);
  }
}

async function loadMenus(tenantId, tenantName) {
  const menus = await api(`/api/menus?tenantId=${tenantId}`);
  $('menuSection').hidden = false;
  $('tenantName').textContent = tenantName;
  $('menus').innerHTML = '';
  for (const m of menus) {
    const div = document.createElement('div');
    div.className = 'card' + (m.available ? '' : ' disabled');
    div.innerHTML = `<strong>${m.name}</strong><br/>${rupiah(m.price)}<br/><small>${m.available ? '➕ Tambah' : 'Habis'}</small>`;
    if (m.available) div.onclick = () => addToCart(m);
    $('menus').appendChild(div);
  }
}

function addToCart(menu) {
  if (cart.length > 0 && cart[0].tenantId !== menu.tenantId) {
    if (!confirm('Keranjang berisi item dari tenant lain. Kosongkan dulu?')) return;
    cart.length = 0;
  }
  const existing = cart.find((c) => c.menuId === menu.id);
  if (existing) existing.quantity += 1;
  else cart.push({ menuId: menu.id, tenantId: menu.tenantId, name: menu.name, price: menu.price, quantity: 1 });
  renderCart();
}

function renderCart() {
  $('cartSection').hidden = cart.length === 0;
  $('cart').innerHTML = cart
    .map((c) => `<li>${c.name} × ${c.quantity} = ${rupiah(c.price * c.quantity)}</li>`)
    .join('');
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  $('total').textContent = total.toLocaleString('id-ID');
}

$('clearCartBtn').onclick = () => { cart.length = 0; renderCart(); };

loadTenants();
