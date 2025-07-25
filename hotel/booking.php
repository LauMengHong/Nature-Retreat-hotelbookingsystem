<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action == 'get_rooms') {
        $checkin = $_GET['checkin'] ?? null;
        $checkout = $_GET['checkout'] ?? null;
        
        $stmt = $pdo->prepare("SELECT * FROM rooms ORDER BY price");
        $stmt->execute();
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Check availability for each room
        foreach ($rooms as &$room) {
            $room['features'] = explode(',', $room['features']);
            
            if ($checkin && $checkout) {
                $stmt = $pdo->prepare("
                    SELECT COUNT(*) as booked_count 
                    FROM bookings 
                    WHERE room_id = ? 
                    AND status = 'confirmed' 
                    AND (checkin_date < ? AND checkout_date > ?)
                ");
                $stmt->execute([$room['id'], $checkout, $checkin]);
                $booked = $stmt->fetch(PDO::FETCH_ASSOC);
                $room['available'] = $booked['booked_count'] < $room['total_rooms'];
            } else {
                $room['available'] = true;
            }
        }
        
        echo json_encode($rooms);
    }
    
    elseif ($action == 'get_bookings') {
        if (!isset($_SESSION['user_email'])) {
            echo json_encode(['success' => false, 'message' => 'Not logged in']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT b.*, r.name as room_name 
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id 
            WHERE b.guest_email = ? 
            ORDER BY b.booking_date DESC
        ");
        $stmt->execute([$_SESSION['user_email']]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($bookings);
    }
    
    elseif ($action == 'apply_voucher') {
        $code = $_GET['code'];
        
        $stmt = $pdo->prepare("SELECT * FROM vouchers WHERE code = ? AND active = 1");
        $stmt->execute([$code]);
        $voucher = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($voucher) {
            echo json_encode(['success' => true, 'voucher' => $voucher]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid voucher code']);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];
    
    if ($action == 'create_booking') {
        $room_id = $_POST['room_id'];
        $guest_name = $_POST['guest_name'];
        $guest_email = $_POST['guest_email'];
        $guest_phone = $_POST['guest_phone'];
        $checkin_date = $_POST['checkin_date'];
        $checkout_date = $_POST['checkout_date'];
        $guests = $_POST['guests'];
        $original_total = $_POST['original_total'];
        $discount_amount = $_POST['discount_amount'] ?? 0;
        $final_total = $_POST['final_total'];
        $voucher_code = $_POST['voucher_code'] ?? null;
        $card_last4 = $_POST['card_last4'] ?? null;
        
        $stmt = $pdo->prepare("
            INSERT INTO bookings (
                room_id, guest_name, guest_email, guest_phone, 
                checkin_date, checkout_date, guests, original_total, 
                discount_amount, final_total, voucher_code, card_last4
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([
            $room_id, $guest_name, $guest_email, $guest_phone,
            $checkin_date, $checkout_date, $guests, $original_total,
            $discount_amount, $final_total, $voucher_code, $card_last4
        ])) {
            $booking_id = $pdo->lastInsertId();
            echo json_encode(['success' => true, 'booking_id' => $booking_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Booking failed']);
        }
    }
    
    elseif ($action == 'cancel_booking') {
        $booking_id = $_POST['booking_id'];
        $guest_email = $_POST['guest_email'];
        
        $stmt = $pdo->prepare("
            UPDATE bookings 
            SET status = 'cancelled' 
            WHERE id = ? AND guest_email = ? AND status = 'confirmed'
        ");
        
        if ($stmt->execute([$booking_id, $guest_email])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Cancellation failed']);
        }
    }
    
    elseif ($action == 'checkout') {
        $booking_id = $_POST['booking_id'];
        $guest_email = $_POST['guest_email'];
        
        $stmt = $pdo->prepare("
            UPDATE bookings 
            SET status = 'checked-out', checkout_date_actual = CURDATE() 
            WHERE id = ? AND guest_email = ? AND status = 'confirmed'
        ");
        
        if ($stmt->execute([$booking_id, $guest_email])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Checkout failed']);
        }
    }
}
?>