const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const DEFAULTS = {
  tenants: [
    { id: 't1', name: 'Bakmi Effata',         open: true  },
    { id: 't2', name: 'Oriental Chicken Rice', open: true  },
    { id: 't3', name: 'Cerita Cinta',          open: false }
  ],
  menus: [
    { id: 'm1', tenantId: 't1', name: 'Bakmi Ayam',        price: 18000, available: true  },
    { id: 'm2', tenantId: 't1', name: 'Bakmi Pangsit',      price: 20000, available: true  },
    { id: 'm3', tenantId: 't1', name: 'Mie Goreng Spesial', price: 22000, available: true  },
    { id: 'm4', tenantId: 't2', name: 'Chicken Rice',       price: 22000, available: true  },
    { id: 'm5', tenantId: 't2', name: 'Nasi Ayam Geprek',   price: 20000, available: true  },
    { id: 'm6', tenantId: 't2', name: 'Es Teh Manis',       price:  5000, available: true  },
    { id: 'm7', tenantId: 't3', name: 'Nasi Rendang',       price: 25000, available: false },
    { id: 'm8', tenantId: 't3', name: 'Soto Ayam',          price: 18000, available: false }
  ],
  users: [
    { id: 'u1', name: 'Budi Santoso', role: 'mahasiswa', refId: 'stu1', email: 'budi@student.ac.id',  password: 'budi123'     },
    { id: 'u2', name: 'Sari Dewi',    role: 'mahasiswa', refId: 'stu2', email: 'sari@student.ac.id',  password: 'sari123'     },
    { id: 'u3', name: 'Pak Effata',   role: 'tenant',    refId: 't1',   email: 'effata@kantin.id',    password: 'effata123'   },
    { id: 'u4', name: 'Bu Oriental',  role: 'tenant',    refId: 't2',   email: 'oriental@kantin.id',  password: 'oriental123' },
    { id: 'u5', name: 'Bu Cerita',    role: 'tenant',    refId: 't3',   email: 'cerita@kantin.id',    password: 'cerita123'   }
  ],
  orders:   [],
  payments: [],
  feedback: []
};

function load() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const saved = JSON.parse(raw);
    return Object.fromEntries(
      Object.keys(DEFAULTS).map((k) => [k, saved[k] ?? DEFAULTS[k]])
    );
  } catch {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

const db = load();

function watched(arr) {
  return new Proxy(arr, {
    set(target, prop, value) {
      target[prop] = value;
      save();
      return true;
    }
  });
}

db.orders   = watched(db.orders);
db.payments = watched(db.payments);
db.feedback = watched(db.feedback);
db.users    = watched(db.users);
db.menus    = watched(db.menus);
db.tenants  = watched(db.tenants);

module.exports = db;
