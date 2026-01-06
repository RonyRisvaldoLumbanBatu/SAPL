const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const { promisePool, testConnection } = require('./config/database');
const session = require('express-session');

app.use(express.json());

app.use(session({
  secret: 'belajarjs-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// Static folder removed - Frontend is separate

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: login required' });
  }
  next();
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(200).json({ success: false, message: 'Username dan password wajib diisi' });
  }

  try {
    const [rows] = await promisePool.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];

      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role // Menyimpan role (admin/kasir) ke session
      };

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Gagal membuat sesi login' });
        }
        return res.status(200).json({
          success: true,
          message: `Login berhasil!`,
          user: req.session.user, // Kirim data user balik ke frontend
          redirect: '/dashboard'
        });
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Login gagal! Username atau password salah.'
      });
    }
  } catch (error) {
    console.error('Database error', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server. Silakan coba lagi.'
    });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Gagal logout' });
    }
    res.json({ success: true, message: 'Logout berhasil' });
  });
});

app.get('/api/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Routes for HTML pages removed - Frontend handles routing now

app.post('/api/users', requireLogin, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(200).json({ success: false, message: 'Semua field wajib diisi' });
  }

  try {
    const [existing] = await promisePool.execute('SELECT id FROM users WHERE username = ?', [username]);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const [result] = await promisePool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );

    res.json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: { id: result.insertId, username }
    });
  } catch (error) {
    console.error('Error creating user', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengguna' });
  }
});

app.get('/api/users', requireLogin, async (req, res) => {
  try {
    const [rows] = await promisePool.execute('SELECT id, username, password FROM users ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna' });
  }
});

// GET - Ambil data user berdasarkan ID
app.get('/api/users/:id', requireLogin, async (req, res) => {
  try {
    const [rows] = await promisePool.execute('SELECT id, username, password FROM users WHERE id = ?', [req.params.id]);

    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
  }
});

// PUT - Update user
app.put('/api/users/:id', requireLogin, async (req, res) => {
  const { username, password } = req.body;
  const userId = req.params.id;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username wajib diisi' });
  }

  try {
    // Cek apakah username sudah digunakan oleh user lain
    const [existing] = await promisePool.execute(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh user lain' });
    }

    // Update dengan atau tanpa password
    let query, params;
    if (password && password.trim() !== '') {
      query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
      params = [username, password, userId];
    } else {
      query = 'UPDATE users SET username = ? WHERE id = ?';
      params = [username, userId];
    }

    const [result] = await promisePool.execute(query, params);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'User berhasil diupdate' });
    } else {
      res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate user' });
  }
});


// DELETE - Hapus user
// --- API PRODUK & TRANSAKSI (POS) ---

// GET - Ambil Semua Menu
// GET - Ambil Semua Menu (Bisa filter aktif/semua)
app.get('/api/products', requireLogin, async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    let query = 'SELECT * FROM products';
    // Jika tidak minta semua (default kasir), hanya tampilkan yang tersedia
    if (!showAll) {
      query += ' WHERE is_available = 1';
    }
    query += ' ORDER BY category, name ASC'; // Urutkan biar rapi

    const [rows] = await promisePool.execute(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching products', error);
    res.status(500).json({ success: false, message: 'Gagal ambil menu' });
  }
});

// ADMIN: Tambah Menu Baru
app.post('/api/products', requireLogin, async (req, res) => {
  const { name, price, category, image, is_available } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Nama, Harga, dan Kategori wajib diisi' });
  }

  try {
    const [result] = await promisePool.execute(
      'INSERT INTO products (name, price, category, image, is_available) VALUES (?, ?, ?, ?, ?)',
      [name, price, category, image || null, is_available !== undefined ? is_available : 1]
    );
    res.json({ success: true, message: 'Menu berhasil ditambahkan', id: result.insertId });
  } catch (error) {
    console.error('Error adding product', error);
    res.status(500).json({ success: false, message: 'Gagal menambah menu' });
  }
});

// ADMIN: Update Menu
app.put('/api/products/:id', requireLogin, async (req, res) => {
  const { name, price, category, image, is_available } = req.body;
  const productId = req.params.id;

  try {
    await promisePool.execute(
      'UPDATE products SET name = ?, price = ?, category = ?, image = ?, is_available = ? WHERE id = ?',
      [name, price, category, image, is_available, productId]
    );
    res.json({ success: true, message: 'Menu berhasil diupdate' });
  } catch (error) {
    console.error('Error updating product', error);
    res.status(500).json({ success: false, message: 'Gagal update menu' });
  }
});

// ADMIN: Hapus Menu (Soft Delete / Hard Delete)
// Disarankan Soft Delete (is_available=0) jika ingin simpan history, tapi user minta fitur hapus.
// Kita pakai Hard Delete untuk sekarang, atau Soft Delete. 
// Kalau Hard Delete, nanti order history yang refer ke sini bisa error jika tidak CASCADE.
// Aman: Kita pakai Hard Delete tapi proteksi try-catch.
app.delete('/api/products/:id', requireLogin, async (req, res) => {
  try {
    await promisePool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu berhasil dihapus permanen' });
  } catch (error) {
    console.error('Error deleting product', error);
    res.status(500).json({ success: false, message: 'Gagal hapus (mungkin masih ada di riwayat transaksi)' });
  }
});

// POST - Simpan Transaksi Baru
app.post('/api/transactions', requireLogin, async (req, res) => {
  const { items, totalAmount, customerName, paymentMethod } = req.body;
  const userId = req.session.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Keranjang kosong' });
  }

  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Simpan Header Transaksi
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, customer_name, total_amount, payment_method) VALUES (?, ?, ?, ?)',
      [userId, customerName || 'Pelanggan', totalAmount, paymentMethod || 'cash']
    );
    const orderId = orderResult.insertId;

    // 2. Simpan Detail Item
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price, item.price * item.quantity]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Transaksi berhasil disimpan!', orderId });

  } catch (error) {
    await connection.rollback();
    console.error('Transaction Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan transaksi' });
  } finally {
    connection.release();
  }
});

// GET - Ambil Transaksi Hari Ini (Mini Report)
app.get('/api/transactions/today', requireLogin, async (req, res) => {
  try {
    const [rows] = await promisePool.execute(
      `SELECT id, total_amount, payment_method, created_at 
       FROM orders 
       WHERE DATE(created_at) = CURDATE() 
       ORDER BY id DESC LIMIT 10`
    );
    console.log(`Cashier History: Found ${rows.length} transactions for today`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching dashboard history:', error);
    res.status(500).json({ success: false, message: 'Gagal ambil data history' });
  }
});

// GET - Admin Dashboard Stats (Ringkasan)
app.get('/api/admin/stats', requireLogin, async (req, res) => {
  try {
    // 1. Omset, Total Transaksi, Rerata Pesanan Hari Ini
    const [stats] = await promisePool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_omset,
        COUNT(*) as total_transaksi,
        COALESCE(AVG(total_amount), 0) as rerata_pesanan
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE()
    `);

    console.log('Stats Result:', stats[0]);
    const [dbTime] = await promisePool.execute('SELECT NOW() as now, CURDATE() as today');
    console.log('DB Time Info:', dbTime[0]);

    // 2. Menu Terlaris (Top 1)
    const [topProduct] = await promisePool.query(`
      SELECT p.name, SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = CURRENT_DATE()
      GROUP BY oi.product_id
      ORDER BY total_sold DESC
      LIMIT 1
    `);

    // 3. Tren Penjualan per Jam (Hari Ini)
    const [trend] = await promisePool.query(`
      SELECT 
        HOUR(created_at) as hour,
        SUM(total_amount) as sales
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE()
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `);

    // 4. List Top 5 Menu Terlaris
    const [topList] = await promisePool.query(`
      SELECT p.name, p.price, SUM(oi.quantity) as sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = CURRENT_DATE()
      GROUP BY oi.product_id
      ORDER BY sales DESC
      LIMIT 5
    `);

    // 5. Rincian Transaksi Terbaru (Limit 10)
    const [recent] = await promisePool.query(`
      SELECT id, total_amount, payment_method, created_at 
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE() 
      ORDER BY id DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { total_omset: 0, total_transaksi: 0, rerata_pesanan: 0 },
        topProduct: topProduct[0] || { name: '-', total_sold: 0 },
        trend: trend || [],
        topList: topList || [],
        recent: recent || []
      }
    });

  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik admin' });
  }
});

// GET - Semua Transaksi (Untuk Laporan Admin)
app.get('/api/admin/transactions', requireLogin, async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT o.*, u.username as cashier_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data transaksi' });
  }
});

app.delete('/api/users/:id', requireLogin, async (req, res) => {
  const userId = req.params.id;

  // Cegah menghapus user yang sedang login
  if (req.session.user && req.session.user.id == userId) {
    return res.status(400).json({ success: false, message: 'Tidak dapat menghapus user yang sedang login' });
  }

  try {
    const [result] = await promisePool.execute('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'User berhasil dihapus' });
    } else {
      res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus user' });
  }
});

app.get('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  testConnection();
});