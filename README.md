# Eatsy

Eatsy adalah aplikasi web FnB yang mengintegrasikan mahasiswa dengan tenant kantin untuk meminimalkan antrean. Mahasiswa dapat memesan dan membayar pesanan secara daring sehingga waktu istirahat menjadi lebih efisien karena mahasiswa hanya tinggal mengambil pesanan di tenant kantin.

## Contributors (Kelompok III)
- Brian Filbert Chandra - `Cipaimian`
- Muhammad Rafi Bagaskara - `PStarz5`
- Digyo Rizky Shine Brutu - `kurayami04`
- Seraphine Kartolo - `cybssera19`
- Anak Agung Ngurah Bagus Rama Putra Suteja - `clodyrama`

## Aktor
1. **Mahasiswa**: Browse menu, bayar, pantau status, buat pesanan, beri ulasan
2. **Tenant / Penjual**: Kelola ketersediaan menu, terima/tolak pesanan, konfirmasi pengambilan
3. **Admin**: Monitoring transaksi total, audit keamanan, manajemen data tenant

## Fitur Utama
- Browse Tenant: `GET /api/tenants`
- Browse Menu: `GET /api/menus?tenantId=...`
- Order: `POST /api/orders`
- Payment: `POST /api/payments`
- Feedback: `POST /api/feedback`
- History: `GET /api/history/:studentId`


## Local Development

```bash
npm install --no-audit --no-fund
npm run lint
npm run smoke
npm start  # http://localhost:3000
```

## Docker

```bash
docker build -t eatsy .
docker run -it --rm -p 3000:3000 eatsy

-it             = interaction dengan terminal
--rm            = otomatis delete container saat berhenti
-p 3000:3000    = Untuk penentuan port, host_port:container_port
```

## CI/CD & DevSecOps Pipeline

Pipeline dijalankan via **GitHub Actions** dengan 3 trigger utama:

| Trigger | Workflow | Tujuan |
| --- | --- | --- |
| Push ke `main` / `develop` | `ci.yml` + `codeql.yml` | Full pipeline + deployment |
| Pull Request ke `main` / `develop` | `ci.yml` + `codeql.yml` | Intercept code tidak aman sebelum merge |
| Setiap senin 02:00 WIB | `security-routine.yml` + `codeql.yml` | Audit proaktif untuk CVE / zero day baru |

### Alur Pipeline (`.github/workflows/ci.yml`)

1. **Build & Test** : checkout, `npm install --no-audit --no-fund`, `npm run lint`, `npm run smoke`.
2. **Security Gate** (paralel):
   - **SAST : CodeQL** (`codeql.yml`): SQL Injection, XSS, hardcoded secret, command injection, path traversal. Hasil masuk ke tab Security GitHub.
   - **SCA : npm audit**: `npm audit --audit-level=high` : pipeline berhenti kalau ada vulnerability high/critical.
   - **Secret Scanning : Gitleaks**: scan commit history + working tree (config: `.gitleaks.toml`).
   - **Container Scan : Trivy**: scan image hasil `docker build` untuk CVE OS/package, output SARIF.
3. **Report Stage** : Semua hasil dikirim ke GitHub Security tab dalam format **SARIF**.
4. **Decision Gate** : Pipeline berhenti jika ada temuan critical/high di salah satu gate.
5. **Deploy Stage**:
   - `develop` → **staging** (manual testing).
   - `main` → **production** (setelah staging hijau).
6. **Notification** : Email otomatis ke tim developer (butuh secrets: `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `NOTIFY_EMAIL`).

### Secrets yang Diperlukan
- `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `NOTIFY_EMAIL` : notifikasi email
- (Opsional, untuk deploy nyata) credentials cloud / registry