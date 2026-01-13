# 🍗 SAPL - Sistem Ayam Penyet Lamongan

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

**SAPL (Sistem Ayam Penyet Lamongan)** adalah aplikasi Point of Sales (POS) yang modern, responsif, dan elegan, dirancang khusus untuk memenuhi kebutuhan manajemen restoran dan UMKM kuliner.

Menggabungkan performa backend **Node.js** yang cepat dengan antarmuka frontend **React + Vite** yang estetik, sistem ini memastikan pengelolaan pesanan, stok, dan laporan keuangan menjadi mudah dan menyenangkan.

---

## ✨ Fitur Unggulan

### 🖥️ Frontend (Kasir & Admin)

- **Aplikasi Kasir Responsif**: Tampilan POS (Point of Sale) yang dapat menyesuaikan layar PC, Tablet, hingga HP (Mobile-Ready).
- **Manajemen Staff**: Tambah, edit, dan kelola akses untuk kasir dan admin dengan mudah.
- **Manajemen Menu**: Tambah produk dengan gambar, kategori (Makanan, Minuman, Extra), dan harga.
- **Keranjang Belanja Pintar**: Hitung total otomatis, kembalian (kalkulator cepat), dan dukungan pembayaran (Tunai/QRIS).
- **Struk Digital**: Cetak struk transaksi secara instan.
- **Dark Mode Premium**: Desain antarmuka _glassmorphism_ yang nyaman di mata.

### ⚙️ Backend & Database

- **RESTful API**: Arsitektur API yang cepat dan aman menggunakan Express.js.
- **Database Terintegrasi**: Penyimpanan data terpusat menggunakan MySQL.
- **Autentikasi Aman**: Sistem login aman dengan _session-based authentication_.

---

## 📸 Penampakan Aplikasi (Screenshots)

_(Tempatkan screenshot aplikasi Anda di sini untuk menarik perhatian)_

|                        Dashboard Admin                         |                    Halaman Kasir                    |
| :------------------------------------------------------------: | :-------------------------------------------------: |
| ![Admin Dashboard](client/public/images/dashboard_preview.png) | ![POS System](client/public/images/pos_preview.png) |

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React.js, Vite, Axios, SweetAlert2, Lucide React (Icons), React Number Format.
- **Backend**: Node.js, Express.js, Express Session, Multer (Upload Gambar).
- **Database**: MySQL (MariaDB).
- **Tools**: Git, Postman (Testing API).

---

## 🚀 Cara Instalasi & Menjalankan

Ikuti langkah mudah ini untuk menjalankan SAPL di komputer lokal Anda:

### 1. Prasyarat

Pastikan Anda sudah menginstal:

- [Node.js](https://nodejs.org/) (Versi LTS disarankan)
- [XAMPP](https://www.apachefriends.org/) (Untuk database MySQL)

### 2. Setup Database

1.  Nyalakan **Apache** dan **MySQL** di XAMPP Control Panel.
2.  Buka `http://localhost/phpmyadmin`.
3.  Buat database baru dengan nama: `belajarjs`
4.  Import file database yang disertakan (`database.sql` atau gunakan migration jika ada).

### 3. Setup Backend (Server)

Buka terminal dan arahkan ke folder utama project:

```bash
# Install dependensi backend
npm install

# Jalankan server
node server.js
```

✅ Server akan berjalan di: `http://localhost:3000`

### 4. Setup Frontend (Client)

Buka terminal **baru**, lalu masuk ke folder client:

```bash
cd client

# Install dependensi frontend
npm install

# Jalankan aplikasi
npm run dev
```

✅ Aplikasi siap diakses di: `http://localhost:5173`

---

## 🔐 Akun Default (Demo)

Gunakan kredensial berikut untuk masuk dan menguji sistem:

| Peran (Role) | Username | Password   | Deskripsi                                                |
| :----------- | :------- | :--------- | :------------------------------------------------------- |
| **Admin**    | `admin`  | `admin123` | Akses penuh (Dashboard, Laporan, Manajemen User & Menu). |
| **Kasir**    | `kasir`  | `kasir123` | Akses POS (Transaksi penjualan).                         |

---

## 📂 Struktur Direktori

```text
SAPL/
├── client/              # Frontend React Vite
│   ├── public/          # Aset publik (Gambar, Icon)
│   ├── src/             # Codingan utama React
│   └── vite.config.js   # Konfigurasi Vite
├── config/              # Konfigurasi Database
├── server.js            # Server Backend Express
├── package.json         # Dependensi Backend
└── README.md            # Dokumentasi ini
```

---

## 🤝 Berkontribusi

Ingin fitur baru atau menemukan bug? Silakan buat **Pull Request** atau laporkan di kolom **Issues**. Kami sangat menghargai kontribusi open-source!

1.  Fork repository ini
2.  Buat branch fitur (`git checkout -b fitur-keren`)
3.  Commit perubahan (`git commit -m 'Menambahkan fitur keren'`)
4.  Push ke branch (`git push origin fitur-keren`)
5.  Open Pull Request

---

## 📜 Lisensi

Project ini dilisensikan di bawah **ISC License**.

---

<center>
  <p>Dibuat dengan ❤️ dan ☕ oleh <b>Rony Risvaldo</b></p>
  <p><i>Maju terus UMKM Kuliner Indonesia! 🇮🇩</i></p>
</center>
