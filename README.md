# SAPL - Sistem Ayam Penyet Lamongan 🍗🔥

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.x-blue)](https://reactjs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**SAPL** (Sistem Ayam Penyet Lamongan) adalah aplikasi **Point of Sales (POS)** modern dan sistem manajemen restoran yang dirancang khusus untuk operasional warung Ayam Penyet. Aplikasi ini menggabungkan performa tinggi Node.js di backend dengan antarmuka pengguna React yang responsif dan estetik.

---

## ✨ Fitur Utama

*   **🛒 Point of Sale (POS)**: Antarmuka kasir yang intuitif untuk pencatatan transaksi cepat.
*   **📊 Admin Dashboard**: Visualisasi data penjualan, omset harian, dan tren pesanan secara real-time.
*   **🍔 Manajemen Menu**: Kontrol penuh atas daftar produk (tambah, edit, hapus, & stok ketersediaan).
*   **👥 Manajemen Pengguna**: Sistem login multi-role (Admin & Kasir) dengan sesi yang aman.
*   **📈 Laporan Transaksi**: Riwayat transaksi lengkap yang dapat dipantau oleh admin untuk audit.
*   **🎨 Premium UI/UX**: Tampilan modern dengan dukungan *Glassmorphism* dan *Dark Mode*.

---

## 🛠️ Teknologi yang Digunakan

| Bagian | Teknologi |
| :--- | :--- |
| **Frontend** | React.js, Vite, Fast CSS Rendering |
| **Backend** | Node.js, Express.js, Express-session |
| **Database** | MySQL (MariaDB) |
| **Library Utama** | MySQL2 (Promise Pool), Lucide Icons, Chart.js/Recharts |

---

## 📂 Struktur Proyek

```text
belajarjs/
├── client/                # Kode sumber Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Halaman utama (Login, Dashboard)
│   │   └── App.jsx        # Routing & Logic Frontend
├── config/                # Konfigurasi database & environment
├── database.sql           # File dump database untuk inisialisasi
├── server.js              # Entry point Backend API
└── package.json           # Dependensi project
```

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
Pastikan Anda sudah menginstall:
*   [Node.js](https://nodejs.org/) (Rekomendasi versi LTS)
*   [XAMPP](https://www.apachefriends.org/) atau MySQL Server versi 8.0+

### 2. Inisialisasi Database
1.  Buka phpMyAdmin atau client MySQL lainnya.
2.  Buat database baru dengan nama `belajarjs`.
3.  Import file `database.sql` yang tersedia di root directory ke dalam database tersebut.

### 3. Setup Backend
Buka terminal di root folder project:
```bash
npm install
node server.js
```
*Server akan berjalan di `http://localhost:3000`*

### 4. Setup Frontend
Buka terminal baru, masuk ke folder client:
```bash
cd client
npm install
npm run dev
```
*Akses aplikasi melalui URL yang tampil di terminal (biasanya `http://localhost:5173`)*

---

## 👤 Akun Percobaan

Gunakan akun berikut untuk mencoba fitur aplikasi:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Owner (Admin)** | `admin` | `admin123` |
| **Kasir** | `kasir` | `kasir123` |

---

## 🤝 Kontribusi

Kontribusi selalu terbuka! Jika Anda memiliki ide untuk fitur baru atau menemukan bug:
1. Fork repository ini.
2. Buat branch fitur baru (`git checkout -b fitur/hebat`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur hebat'`).
4. Push ke branch tersebut (`git push origin fitur/hebat`).
5. Buat Pull Request.

---

## 📜 Lisensi

Project ini dilisensikan di bawah **ISC License**. Bebas digunakan dan dikembangkan untuk keperluan belajar maupun komersial skala kecil.

---
*Dibuat oleh [Rony Risvaldo](https://github.com/RonyRisvaldoLumbanBatu) dengan ❤️ untuk kemajuan UMKM Indonesia.*
