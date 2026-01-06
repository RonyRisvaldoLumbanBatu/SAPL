CREATE DATABASE IF NOT EXISTS belajarjs;
USE belajarjs;

-- Tabel Users dengan Role
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Menu / Produk
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- Makanan, Minuman, Paket, Extra
  stock INT DEFAULT 100, -- Stok sederhana
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transaksi (Header)
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT, -- Kasir yang input
  customer_name VARCHAR(100) DEFAULT 'Pelanggan',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Detail Transaksi (Item yang dibeli)
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL, -- Harga saat itu (antisipasi harga naik)
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- DATA DUMMY (Seeding) --

-- 1. Users
INSERT INTO users (username, password, name, role) VALUES 
('admin', 'admin123', 'Bos Besar', 'admin'),
('kasir', 'kasir123', 'Bayu Kasir', 'kasir');

-- 2. Products (Menu Ayam Penyet Lamongan)
INSERT INTO products (name, price, category) VALUES 
('Ayam Penyet Dada', 18000, 'Makanan'),
('Ayam Penyet Paha', 17000, 'Makanan'),
('Lele Goreng', 15000, 'Makanan'),
('Tahu/Tempe Penyet', 10000, 'Makanan'),
('Nasi Putih', 5000, 'Makanan'),
('Es Teh Manis', 4000, 'Minuman'),
('Es Jeruk', 5000, 'Minuman'),
('Sambal Terasi (Extra)', 3000, 'Extra');

-- 3. Transaksi Contoh (Order)
INSERT INTO orders (user_id, customer_name, total_amount) VALUES 
(2, 'Budi', 27000);

-- Detail order si Budi (1 Ayam Paha + 1 Es Teh + 1 Nasi + 1 Sambal)
INSERT INTO order_items (order_id, product_id, quantity, price_at_time, subtotal) VALUES 
(1, 2, 1, 17000, 17000), -- Ayam Paha
(1, 5, 1, 5000, 5000),   -- Nasi
(1, 6, 1, 5000, 5000);   -- Es Jeruk (eh salah harga di atas 4k, gpp ini contoh history)
