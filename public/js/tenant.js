const { api, rupiah, $ } = window.Eatsy;

async function loadTenantSelect() {
  const tenants = await api('/api/tenants');
  $('tenantSelect').innerHTML = tenants
    .map((t) => `<option value="${t.id}">${t.name}</option>`)
    .join('');
  $('tenantSelect').onchange = refresh;
  refresh();
}

async function refresh() {
  const tenantId = $('tenantSelect').value;
  if (!tenantId) return;
  await loadMenuMgmt(tenantId);
}

async function loadMenuMgmt(tenantId) {
  const menus = await api(`/api/menus?tenantId=${tenantId}`);
  $('menuTable').innerHTML = menus.map((m) => `
    <tr>
      <td>${m.name}</td>
      <td>${rupiah(m.price)}</td>
      <td>${m.available ? '✅' : '❌'}</td>
      <td><button data-menu="${m.id}" data-avail="${!m.available}">
        ${m.available ? 'Set Habis' : 'Set Tersedia'}
      </button></td>
    </tr>`).join('');

  document.querySelectorAll('button[data-menu]').forEach((btn) => {
    btn.onclick = async () => {
      await api(`/api/menus/${btn.dataset.menu}`, {
        method: 'PATCH',
        body: { available: btn.dataset.avail === 'true' },
      });
      refresh();
    };
  });
}

$('refreshBtn').onclick = refresh;
loadTenantSelect();
