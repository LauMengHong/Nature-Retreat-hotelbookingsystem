CREATE DATABASE IF NOT EXISTS hotel_booking;
USE hotel_booking;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_guests INT NOT NULL,
    features TEXT,
    total_rooms INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount DECIMAL(10,2) NOT NULL,
    type ENUM('percentage', 'fixed') NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
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
    checkout_date_actual DATE NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Insert default users
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'user@hotel.com', 'user123', 'user'),
('Admin User', 'admin@hotel.com', 'admin123', 'admin');

-- Insert default rooms
INSERT INTO rooms (name, price, max_guests, features) VALUES
('Forest View Cabin', 120.00, 2, 'Forest Views,Fireplace,Private Deck'),
('Mountain Lodge', 250.00, 4, 'Mountain Vista,Hot Spring,Hiking Trails'),
('Tree House Suite', 350.00, 3, 'Canopy Living,Bird Watching,Stargazing'),
('Lakeside Villa', 500.00, 6, 'Lake Access,Kayaks,Outdoor Spa');

-- Insert default vouchers
INSERT INTO vouchers (code, discount, type) VALUES
('WELCOME10', 10.00, 'percentage'),
('SAVE50', 50.00, 'fixed'),
('SUMMER20', 20.00, 'percentage');

-- Insert sample bookings
INSERT INTO bookings (room_id, guest_name, guest_email, guest_phone, checkin_date, checkout_date, guests, original_total, final_total, status) VALUES
(1, 'Jane Smith', 'jane@example.com', '+1234567890', '2025-07-04', '2025-07-06', 2, 240.00, 240.00, 'confirmed'),
(2, 'Bob Johnson', 'bob@example.com', '+0987654321', '2025-08-15', '2025-08-17', 3, 500.00, 500.00, 'confirmed');