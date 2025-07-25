<?php
$host = 'localhost';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Drop and recreate database
    $pdo->exec("DROP DATABASE IF EXISTS hotel_booking");
    $pdo->exec("CREATE DATABASE hotel_booking");
    $pdo->exec("USE hotel_booking");
    
    // Create tables with correct column names
    $pdo->exec("CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        max_guests INT NOT NULL,
        features TEXT,
        total_rooms INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount DECIMAL(10,2) NOT NULL,
        type ENUM('percentage', 'fixed') NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        guest_name VARCHAR(100) NOT NULL,
        guest_email VARCHAR(100) NOT NULL,
        guest_phone VARCHAR(20) NOT NULL,
        checkin_date DATE NOT NULL,
        checkout_date DATE NOT NULL,
        guests INT NOT NULL,
        original_total DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        final_total DECIMAL(10,2) NOT NULL,
        voucher_code VARCHAR(50),
        payment_method VARCHAR(50) DEFAULT 'Credit Card',
        card_last4 VARCHAR(4),
        status ENUM('confirmed', 'checked-out', 'cancelled') DEFAULT 'confirmed',
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checkout_date_actual DATE NULL
    )");
    
    // Insert data
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Admin User', 'admin@hotel.com', 'admin123', 'admin']);
    $stmt->execute(['John Doe', 'user@hotel.com', 'user123', 'user']);
    
    $stmt = $pdo->prepare("INSERT INTO rooms (name, price, max_guests, features) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Forest View Cabin', 120.00, 2, 'Forest Views,Fireplace,Private Deck']);
    $stmt->execute(['Mountain Lodge', 250.00, 4, 'Mountain Vista,Hot Spring,Hiking Trails']);
    $stmt->execute(['Tree House Suite', 350.00, 3, 'Canopy Living,Bird Watching,Stargazing']);
    $stmt->execute(['Lakeside Villa', 500.00, 6, 'Lake Access,Kayaks,Outdoor Spa']);
    
    $stmt = $pdo->prepare("INSERT INTO vouchers (code, discount, type) VALUES (?, ?, ?)");
    $stmt->execute(['WELCOME10', 10.00, 'percentage']);
    $stmt->execute(['SAVE50', 50.00, 'fixed']);
    $stmt->execute(['SUMMER20', 20.00, 'percentage']);
    
    echo "<h2>Database Reset Complete!</h2>";
    echo "<p><strong>Admin:</strong> admin@hotel.com / admin123</p>";
    echo "<p><strong>User:</strong> user@hotel.com / user123</p>";
    echo "<p><a href='index.html'>Go to Hotel System</a></p>";
    
} catch(PDOException $e) {
    echo "Reset failed: " . $e->getMessage();
}
?>