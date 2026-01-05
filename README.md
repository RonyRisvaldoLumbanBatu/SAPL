# SAPL - Sistem Ayam Penyet Lamongan 🍗🔥

**SAPL** adalah aplikasi Point of Sales (POS) modern yang dirancang khusus untuk manajemen warung Ayam Penyet Lamongan. Dibangun dengan teknologi web modern untuk performa cepat dan tampilan premium.

## 🚀 Teknologi yang Digunakan
*   **Frontend**: React.js (Vite) - Antarmuka pengguna yang cepat dan responsif.
*   **Backend**: Node.js & Express - API server yang handal.
*   **Database**: MySQL - Penyimpanan data transaksi dan pengguna.
*   **Styling**: CSS Modern (Glassmorphism & Dark Mode).

## 📂 Struktur Project
Project ini terdiri dari dua bagian utama:
1.  **Root Directory**: Berisi kode server Backend (`server.js`).
2.  **`/client`**: Berisi kode Frontend React.

## 🛠️ Cara Menjalankan

### Prasyarat
*   Node.js terinstall.
*   MySQL/XAMPP aktif.
*   Database `belajarjs` sudah di-import dari file `database.sql`.

### 1. Menjalankan Backend (Server API)
Buka terminal di folder root project:
```bash
# Install dependencies (jika belum)
npm install

# Jalankan server
node server.js
```
Server akan berjalan di `http://localhost:3000`.

### 2. Menjalankan Frontend (React)
Buka terminal BARU, masuk ke folder client:
```bash
cd client

# Install dependencies frontend (jika belum)
npm install

# Jalankan mode pengembangan
npm run dev
```
Buka link yang muncul (biasanya `http://localhost:5173`) di browser Anda.

## 👤 Akun Demo
*   **Admin (Owner)**: `admin` / `admin123`
*   **Kasir**: `kasir` / `kasir123`

---
*Dibuat dengan ❤️ dan 🌶️ untuk UMKM Indonesia.*
