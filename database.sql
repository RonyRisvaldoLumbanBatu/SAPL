CREATE DATABASE IF NOT EXISTS belajarjs;
USE belajarjs;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 07 Jan 2026 pada 12.20
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `belajarjs`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT 'Pelanggan',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `status` enum('pending','completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `total_amount`, `payment_method`, `status`, `created_at`) VALUES
(1, 2, 'Budi', 27000.00, 'cash', 'completed', '2026-01-05 03:48:41'),
(2, 2, 'Pelanggan Umum', 89000.00, 'cash', 'completed', '2026-01-06 02:42:57'),
(3, 2, 'Pelanggan Umum', 54000.00, 'cash', 'completed', '2026-01-06 02:47:39'),
(4, 2, 'Pelanggan Umum', 91000.00, 'cash', 'completed', '2026-01-06 02:54:26'),
(5, 2, 'Pelanggan Umum', 55000.00, 'cash', 'completed', '2026-01-06 03:51:28'),
(6, 2, 'Pelanggan Umum', 53000.00, 'cash', 'completed', '2026-01-06 04:06:32'),
(7, 2, 'Pelanggan Umum', 92000.00, 'cash', 'completed', '2026-01-06 04:30:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_time`, `subtotal`) VALUES
(1, 1, 2, 1, 17000.00, 17000.00),
(2, 1, 5, 1, 5000.00, 5000.00),
(3, 1, 6, 1, 5000.00, 5000.00),
(4, 2, 3, 1, 20000.00, 20000.00),
(5, 2, 4, 1, 15000.00, 15000.00),
(6, 2, 5, 1, 28000.00, 28000.00),
(7, 2, 6, 1, 12000.00, 12000.00),
(8, 2, 9, 1, 5000.00, 5000.00),
(9, 2, 10, 1, 7000.00, 7000.00),
(10, 2, 16, 1, 2000.00, 2000.00),
(11, 3, 1, 1, 18000.00, 18000.00),
(12, 3, 2, 1, 17000.00, 17000.00),
(13, 3, 9, 1, 5000.00, 5000.00),
(14, 3, 10, 1, 7000.00, 7000.00),
(15, 3, 11, 1, 4000.00, 4000.00),
(16, 3, 15, 1, 3000.00, 3000.00),
(17, 4, 1, 1, 18000.00, 18000.00),
(18, 4, 2, 1, 17000.00, 17000.00),
(19, 4, 3, 1, 20000.00, 20000.00),
(20, 4, 5, 1, 28000.00, 28000.00),
(21, 4, 9, 1, 5000.00, 5000.00),
(22, 4, 15, 1, 3000.00, 3000.00),
(23, 5, 1, 1, 18000.00, 18000.00),
(24, 5, 2, 1, 17000.00, 17000.00),
(25, 5, 3, 1, 20000.00, 20000.00),
(26, 6, 1, 1, 18000.00, 18000.00),
(27, 6, 3, 1, 20000.00, 20000.00),
(28, 6, 4, 1, 15000.00, 15000.00),
(29, 7, 3, 1, 20000.00, 20000.00),
(30, 7, 2, 2, 17000.00, 34000.00),
(31, 7, 5, 1, 28000.00, 28000.00),
(32, 7, 7, 1, 10000.00, 10000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `stock` int(11) DEFAULT 100,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `category`, `stock`, `is_available`, `created_at`) VALUES
(1, 'Ayam Penyet Dada', 18000.00, 'Makanan', 50, 1, '2026-01-06 02:39:01'),
(2, 'Ayam Penyet Paha', 17000.00, 'Makanan', 50, 1, '2026-01-06 02:39:01'),
(3, 'Ayam Bakar Madu', 20000.00, 'Makanan', 40, 1, '2026-01-06 02:39:01'),
(4, 'Lele Goreng Crispy', 15000.00, 'Makanan', 60, 1, '2026-01-06 02:39:01'),
(5, 'Bebek Goreng Surabaya', 28000.00, 'Makanan', 20, 1, '2026-01-06 02:39:01'),
(6, 'Ati Ampela Penyet', 12000.00, 'Makanan', 30, 1, '2026-01-06 02:39:01'),
(7, 'Tahu Tempe Penyet', 10000.00, 'Makanan', 100, 1, '2026-01-06 02:39:01'),
(8, 'Nasi Putih', 5000.00, 'Makanan', 200, 1, '2026-01-06 02:39:01'),
(9, 'Es Teh Manis', 5000.00, 'Minuman', 100, 1, '2026-01-06 02:39:01'),
(10, 'Es Jeruk Peras', 7000.00, 'Minuman', 100, 1, '2026-01-06 02:39:01'),
(11, 'Teh Hangat', 4000.00, 'Minuman', 100, 1, '2026-01-06 02:39:01'),
(12, 'Jeruk Hangat', 6000.00, 'Minuman', 100, 1, '2026-01-06 02:39:01'),
(13, 'Air Mineral', 4000.00, 'Minuman', 100, 1, '2026-01-06 02:39:01'),
(14, 'Sambal Terasi (Extra)', 3000.00, 'Extra', 999, 1, '2026-01-06 02:39:01'),
(15, 'Sambal Ijo (Extra)', 3000.00, 'Extra', 999, 1, '2026-01-06 02:39:01'),
(16, 'Kerupuk Putih', 2000.00, 'Extra', 50, 1, '2026-01-06 02:39:01'),
(17, 'Pete Goreng', 8000.00, 'Extra', 15, 1, '2026-01-06 02:39:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role` enum('admin','kasir') NOT NULL DEFAULT 'kasir',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `created_at`) VALUES
(1, 'admin', 'admin123', 'Bos Besar', 'admin', '2026-01-05 03:48:41'),
(2, 'kasir', 'kasir123', 'Bayu Kasir', 'kasir', '2026-01-05 03:48:41');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
