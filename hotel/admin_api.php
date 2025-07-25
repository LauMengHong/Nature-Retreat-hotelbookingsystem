<?php
require_once 'config.php';
header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];
    
    if ($action == 'change_user_password') {
        $user_id = $_POST['user_id'];
        $new_password = $_POST['new_password'];
        
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        if ($stmt->execute([$new_password, $user_id])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Password change failed']);
        }
    }
    
    elseif ($action == 'update_booking_status') {
        $booking_id = $_POST['booking_id'];
        $status = $_POST['status'];
        
        $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        if ($stmt->execute([$status, $booking_id])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Status update failed']);
        }
    }
    
    elseif ($action == 'add_room') {
        $name = $_POST['name'];
        $price = $_POST['price'];
        $max_guests = $_POST['max_guests'];
        $features = $_POST['features'];
        
        $stmt = $pdo->prepare("INSERT INTO rooms (name, price, max_guests, features) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$name, $price, $max_guests, $features])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Room creation failed']);
        }
    }
    
    elseif ($action == 'add_voucher') {
        $code = $_POST['code'];
        $discount = $_POST['discount'];
        $type = $_POST['type'];
        
        $stmt = $pdo->prepare("INSERT INTO vouchers (code, discount, type) VALUES (?, ?, ?)");
        if ($stmt->execute([$code, $discount, $type])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Voucher creation failed']);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action == 'get_users') {
        $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
    }
    
    elseif ($action == 'get_all_bookings') {
        $stmt = $pdo->prepare("
            SELECT b.*, r.name as room_name 
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id 
            ORDER BY b.booking_date DESC
        ");
        $stmt->execute();
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($bookings);
    }
    
    elseif ($action == 'get_rooms') {
        $stmt = $pdo->prepare("SELECT * FROM rooms ORDER BY name");
        $stmt->execute();
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rooms);
    }
    
    elseif ($action == 'get_vouchers') {
        $stmt = $pdo->prepare("SELECT * FROM vouchers ORDER BY created_at DESC");
        $stmt->execute();
        $vouchers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($vouchers);
    }
}
?>