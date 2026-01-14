CREATE DATABASE IF NOT EXISTS belajarjs;
USE belajarjs;

-- SAPL Database Dump
-- Updated: 14 January 2026

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT 'Tanpa Nama',
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','kasir') NOT NULL DEFAULT 'kasir',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`) VALUES
(1, 'Bos Besar', 'admin', 'admin123', 'admin'),
(2, 'Bayu Kasir', 'kasir', 'kasir123', 'kasir');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 100,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `category`, `image`, `stock`, `is_available`) VALUES
(1, 'Ayam Penyet Dada', 18000.00, 'Makanan', 'Ayam Penyet Dada.jpeg', 50, 1),
(2, 'Ayam Penyet Paha', 17000.00, 'Makanan', 'Ayam Penyet Paha.jpeg', 50, 1),
(3, 'Ayam Bakar Madu', 20000.00, 'Makanan', 'Ayam Bakar Madu.png', 40, 1),
(4, 'Lele Goreng Crispy', 15000.00, 'Makanan', 'Lele Goreng Crispy.jpg', 60, 1),
(5, 'Bebek Goreng Surabaya', 28000.00, 'Makanan', 'Bebek Goreng Surabaya.jpg', 20, 1),
(6, 'Ati Ampela Penyet', 12000.00, 'Makanan', 'Ati Ampela Penyet.jpg', 30, 1),
(7, 'Tahu Tempe Penyet', 10000.00, 'Makanan', 'Tahu Tempe Penyet.jpg', 100, 1),
(8, 'Nasi Putih', 5000.00, 'Makanan', 'Nasi Putih.jpeg', 200, 1),
(9, 'Es Teh Manis', 5000.00, 'Minuman', 'Es Teh Manis.jpg', 100, 1),
(10, 'Es Jeruk Peras', 7000.00, 'Minuman', 'Es Jeruk Peras.jpeg', 100, 1),
(11, 'Teh Hangat', 4000.00, 'Minuman', 'Teh Hangat.avif', 100, 1),
(12, 'Jeruk Hangat', 6000.00, 'Minuman', 'Jeruk Hangat.jpeg', 100, 1),
(13, 'Air Mineral', 4000.00, 'Minuman', 'Air Mineral.jpg', 100, 1),
(14, 'Sambal Terasi (Extra)', 3000.00, 'Extra', 'Sambal Terasi (Extra).jpg', 999, 1),
(15, 'Sambal Ijo (Extra)', 3000.00, 'Extra', 'Sambal Ijo (Extra).jpg', 999, 1),
(16, 'Kerupuk Putih', 2000.00, 'Extra', 'Kerupuk Putih.jpeg', 50, 1),
(17, 'Pete Goreng', 8000.00, 'Extra', 'Pete Goreng.jpg', 15, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT 'Pelanggan',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `status` enum('pending','completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
