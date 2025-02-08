-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table healthcare.foodrecord: ~3 rows (approximately)
REPLACE INTO `foodrecord` (`id`, `userId`, `name`, `time`, `date`, `calories`, `createdAt`) VALUES
	(1, 1, 'แกงเขียวหวาน', '2025-01-20 12:30:00.000', '2025-01-20 00:00:00.000', 300, '2025-01-19 17:28:26.256'),
	(2, 1, 'แกงแดงหวาน', '2025-01-20 05:30:00.000', '2025-01-20 00:00:00.000', 300, '2025-01-19 18:07:10.246'),
	(3, 1, 'จิ้มจุ่ม', '2025-01-20 03:09:00.000', '2025-01-20 01:41:56.858', 300, '2025-01-19 18:50:39.164');

-- Dumping data for table healthcare.user: ~2 rows (approximately)
REPLACE INTO `user` (`id`, `email`, `password`, `createdAt`, `updatedAt`, `name`) VALUES
	(1, 'Eakapap@gmail.com', '$2b$10$urHhtZx5uATD539/28Sz9u4hFaQg42khRa0xo/qoWi/iOJYEY2zfq', '2025-01-19 13:30:34.188', '2025-01-19 13:30:34.188', 'Dontree'),
	(2, 'jimjum@gmail.com', '$2b$10$ThnyC27T0KxACZpbG9jzg.l7iZw7X.levUHfbqEsI/T.IjmMgmM8i', '2025-01-19 14:14:17.014', '2025-01-19 14:14:17.014', 'JimJum');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
