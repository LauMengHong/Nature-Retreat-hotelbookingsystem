# Hotel Booking System - PHP Setup Instructions

## Prerequisites
- XAMPP (Apache + MySQL + PHP)
- Web browser

## Setup Steps

### 1. Install XAMPP
- Download and install XAMPP from https://www.apachefriends.org/
- Start Apache and MySQL services

### 2. Database Setup
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import the `database.sql` file to create the database and tables
3. Or run the SQL commands manually:
   ```sql
   CREATE DATABASE hotel_booking;
   ```
   Then copy and paste the contents of `database.sql`

### 3. File Placement
- Copy all project files to `C:\xampp\htdocs\hotel\`
- Ensure the following files are present:
  - `index.html`
  - `admin.html`
  - `config.php`
  - `auth.php`
  - `booking.php`
  - `admin_api.php`
  - `script_php.js`
  - `styles.css`
  - `database.sql`

### 4. Configuration
- Edit `config.php` if needed to match your database settings:
  ```php
  $host = 'localhost';
  $dbname = 'hotel_booking';
  $username = 'root';
  $password = '';
  ```

### 5. Access the Application
- User Interface: http://localhost/hotel/
- Admin Interface: http://localhost/hotel/admin.html

## Default Login Credentials

### User Account
- Email: user@hotel.com
- Password: user123

### Admin Account
- Email: admin@hotel.com
- Password: admin123

## Features Implemented

### User Features
- User registration and login
- Password reset with custom password
- Room search and booking
- Voucher code application
- Payment processing simulation
- Booking management (view, cancel)
- Check-out functionality
- Downloadable booking vouchers

### Admin Features
- User management
- Booking management
- Room management
- Voucher management
- Password reset for users

### Database Tables
- `users` - User accounts and authentication
- `rooms` - Room information and pricing
- `bookings` - Booking records with payment details
- `vouchers` - Discount codes and vouchers

## Voucher Codes
- WELCOME10 - 10% discount
- SAVE50 - $50 fixed discount
- SUMMER20 - 20% discount

## File Structure
```
hotel/
├── index.html          # Main user interface
├── admin.html          # Admin interface
├── config.php          # Database configuration
├── auth.php            # Authentication API
├── booking.php         # Booking management API
├── admin_api.php       # Admin management API
├── script_php.js       # Frontend JavaScript (PHP integrated)
├── styles.css          # Styling
├── database.sql        # Database structure
└── setup_instructions.md
```

## Troubleshooting
1. Ensure XAMPP Apache and MySQL are running
2. Check database connection in `config.php`
3. Verify file permissions
4. Check browser console for JavaScript errors
5. Ensure all PHP files are in the correct directory