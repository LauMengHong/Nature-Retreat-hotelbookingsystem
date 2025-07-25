<?php
require_once 'config.php';

// Force admin login
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = 'admin@hotel.com'");
$stmt->execute();
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if ($admin) {
    $_SESSION['user_id'] = $admin['id'];
    $_SESSION['user_name'] = $admin['name'];
    $_SESSION['user_email'] = $admin['email'];
    $_SESSION['user_role'] = $admin['role'];
}

// Get bookings
$stmt = $pdo->prepare("SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id ORDER BY b.booking_date DESC");
$stmt->execute();
$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get users
$stmt = $pdo->prepare("SELECT id, name, email, role FROM users ORDER BY created_at DESC");
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get rooms
$stmt = $pdo->prepare("SELECT * FROM rooms ORDER BY name");
$stmt->execute();
$rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Nature Retreat</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- User Info Display -->
    <div id="userInfo" class="user-info" style="display: block;">
        <span id="userDisplayName">Welcome, <?php echo $_SESSION['user_name']; ?></span>
        <button class="logout-btn" onclick="logout()">Logout</button>
    </div>

    <!-- Admin Panel -->
    <div id="adminContent" class="admin-panel" style="display: block;">
        <div class="container">
            <div class="admin-header">
                <h1>⚡ Smart Hotel Management System</h1>
                <p>AI-Powered Booking & Real-Time Operations Control System</p>
            </div>

            <div class="admin-tabs">
                <button class="tab-btn active" onclick="showTab('bookings')">All Bookings</button>
                <button class="tab-btn" onclick="showTab('rooms')">Room Management</button>
                <button class="tab-btn" onclick="showTab('users')">User Management</button>
            </div>

            <div id="bookingsTab" class="tab-content active">
                <div class="booking-section">
                    <div id="bookingStats" class="booking-stats" style="display: flex; gap: 20px; margin-bottom: 30px;">
                        <!-- Stats will be loaded here -->
                    </div>
                    <h3 style="margin-bottom: 20px; color: var(--forest-green);">Recent Bookings</h3>
                    <table class="bookings-table" id="bookingsTable">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Guest Name</th>
                                <th>Room</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Guests</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="bookingsTableBody">
                            <?php foreach ($bookings as $booking): ?>
                            <tr>
                                <td>#<?php echo $booking['id']; ?></td>
                                <td><?php echo $booking['guest_name']; ?></td>
                                <td><?php echo $booking['room_name']; ?></td>
                                <td><?php echo $booking['checkin_date']; ?></td>
                                <td><?php echo $booking['checkout_date']; ?></td>
                                <td><?php echo $booking['guests']; ?></td>
                                <td>$<?php echo $booking['final_total']; ?></td>
                                <td><span class="status-badge status-<?php echo $booking['status']; ?>"><?php echo strtoupper($booking['status']); ?></span></td>
                                <td><button onclick="cancelBooking(<?php echo $booking['id']; ?>)" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Cancel</button></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="roomsTab" class="tab-content">
                <div class="booking-section">
                    <h3 style="margin-bottom: 20px; color: var(--forest-green);">Room Availability Calendar</h3>
                    <div id="roomCalendarContainer">
                        <?php foreach ($rooms as $room): ?>
                        <div class="room-calendar">
                            <h4><?php echo $room['name']; ?> - <?php echo date('F Y'); ?></h4>
                            <div class="calendar-grid">
                                <div class="calendar-header">Sun</div>
                                <div class="calendar-header">Mon</div>
                                <div class="calendar-header">Tue</div>
                                <div class="calendar-header">Wed</div>
                                <div class="calendar-header">Thu</div>
                                <div class="calendar-header">Fri</div>
                                <div class="calendar-header">Sat</div>
                                <?php
                                $currentMonth = date('n');
                                $currentYear = date('Y');
                                $firstDay = mktime(0, 0, 0, $currentMonth, 1, $currentYear);
                                $startDay = date('w', $firstDay);
                                $daysInMonth = date('t', $firstDay);
                                
                                // Get bookings for this room
                                $roomBookings = array_filter($bookings, function($booking) use ($room) {
                                    return $booking['room_id'] == $room['id'] && $booking['status'] == 'confirmed';
                                });
                                
                                // Generate calendar days
                                for ($i = 0; $i < $startDay; $i++) {
                                    echo '<div class="calendar-day other-month"></div>';
                                }
                                
                                for ($day = 1; $day <= $daysInMonth; $day++) {
                                    $currentDate = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $day);
                                    $isBooked = false;
                                    
                                    foreach ($roomBookings as $booking) {
                                        if ($currentDate >= $booking['checkin_date'] && $currentDate < $booking['checkout_date']) {
                                            $isBooked = true;
                                            break;
                                        }
                                    }
                                    
                                    $dayClass = $isBooked ? 'calendar-day booked' : 'calendar-day available';
                                    echo "<div class='$dayClass' title='$currentDate'>$day</div>";
                                }
                                
                                $totalCells = $startDay + $daysInMonth;
                                $remainingCells = 42 - $totalCells;
                                for ($i = 0; $i < $remainingCells; $i++) {
                                    echo '<div class="calendar-day other-month"></div>';
                                }
                                ?>
                            </div>
                            <div class="calendar-legend">
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #d4edda; border-color: #c3e6cb;"></div>
                                    <span>Available</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #f8d7da; border-color: #f5c6cb;"></div>
                                    <span>Booked</span>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <div id="usersTab" class="tab-content">
                <div class="booking-section">
                    <h3 style="margin-bottom: 20px; color: var(--forest-green);">User Management</h3>
                    <table class="bookings-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <?php foreach ($users as $user): ?>
                            <tr>
                                <td>#<?php echo $user['id']; ?></td>
                                <td><?php echo $user['name']; ?></td>
                                <td><?php echo $user['email']; ?></td>
                                <td><span class="status-badge status-<?php echo $user['role'] === 'admin' ? 'pending' : 'confirmed'; ?>"><?php echo strtoupper($user['role']); ?></span></td>
                                <td>
                                    <button onclick="openUserPasswordModal(<?php echo $user['id']; ?>)" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Change Password</button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="settingsTab" class="tab-content">
                <div class="booking-section">
                    <h3 style="margin-bottom: 20px; color: var(--forest-green);">Change Password</h3>
                    <form id="changePasswordForm" style="max-width: 400px;">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm New Password</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        <button type="submit" class="confirm-btn">Update Password</button>
                    </form>
                </div>
            </div>

            <!-- User Password Change Modal -->
            <div id="userPasswordModal" class="booking-modal">
                <div class="modal-content">
                    <button class="close-btn" onclick="closeUserPasswordModal()">✕</button>
                    <div class="modal-header">
                        <h2>Change User Password</h2>
                        <p id="selectedUserInfo"></p>
                    </div>
                    <form id="userPasswordForm" class="booking-form">
                        <div class="form-group">
                            <label for="userNewPassword">New Password</label>
                            <input type="password" id="userNewPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="userConfirmPassword">Confirm Password</label>
                            <input type="password" id="userConfirmPassword" required>
                        </div>
                        <button type="submit" class="confirm-btn">Update User Password</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
    let selectedUserId = null;
    
    function showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
        
        if (tabName === 'bookings') {
            loadBookingStats();
        }
    }
    
    function loadBookingStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const totalOrders = <?php echo count($bookings); ?>;
        const staying = <?php 
            $staying = 0;
            foreach($bookings as $booking) {
                if($booking['status'] === 'confirmed' && $booking['checkin_date'] <= date('Y-m-d') && $booking['checkout_date'] > date('Y-m-d')) {
                    $staying++;
                }
            }
            echo $staying;
        ?>;
        const completed = <?php 
            $completed = 0;
            foreach($bookings as $booking) {
                if($booking['status'] === 'checked-out') {
                    $completed++;
                }
            }
            echo $completed;
        ?>;
        
        document.getElementById('bookingStats').innerHTML = `
            <div class="stat-card" style="background: #e8f5e8; padding: 20px; border-radius: 15px; text-align: center; flex: 1;">
                <h4 style="color: var(--forest-green); margin: 0 0 10px 0;">Total Orders</h4>
                <div style="font-size: 2rem; font-weight: bold; color: var(--forest-green);">${totalOrders}</div>
            </div>
            <div class="stat-card" style="background: #fff3cd; padding: 20px; border-radius: 15px; text-align: center; flex: 1;">
                <h4 style="color: #856404; margin: 0 0 10px 0;">Currently Staying</h4>
                <div style="font-size: 2rem; font-weight: bold; color: #856404;">${staying}</div>
            </div>
            <div class="stat-card" style="background: #d4edda; padding: 20px; border-radius: 15px; text-align: center; flex: 1;">
                <h4 style="color: #155724; margin: 0 0 10px 0;">Completed</h4>
                <div style="font-size: 2rem; font-weight: bold; color: #155724;">${completed}</div>
            </div>
        `;
    }
    
    async function cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                const formData = new FormData();
                formData.append('action', 'update_booking_status');
                formData.append('booking_id', bookingId);
                formData.append('status', 'cancelled');
                
                const response = await fetch('admin_api.php', { method: 'POST', body: formData });
                const result = await response.json();
                
                if (result.success) {
                    alert('Booking cancelled successfully!');
                    location.reload(); // Refresh the page to show updated data
                } else {
                    alert('Failed to cancel booking: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                alert('Error cancelling booking: ' + error.message);
            }
        }
    }
    
    function openUserPasswordModal(userId) {
        selectedUserId = userId;
        document.getElementById('userPasswordModal').style.display = 'block';
    }
    
    function closeUserPasswordModal() {
        document.getElementById('userPasswordModal').style.display = 'none';
        document.getElementById('userPasswordForm').reset();
        selectedUserId = null;
    }
    
    function logout() {
        window.location.href = 'index.html';
    }
    
    document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'change_admin_password');
        formData.append('current_password', currentPassword);
        formData.append('new_password', newPassword);
        
        try {
            const response = await fetch('admin_api.php', { method: 'POST', body: formData });
            const text = await response.text();
            
            try {
                const result = JSON.parse(text);
                if (result.success) {
                    alert('Password changed successfully!');
                    document.getElementById('changePasswordForm').reset();
                } else {
                    alert(result.message || 'Password change failed');
                }
            } catch (jsonError) {
                console.log('Server response:', text);
                alert('Server error. Check console for details.');
            }
        } catch (error) {
            alert('Error changing password: ' + error.message);
        }
    });
    
    document.getElementById('userPasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('userNewPassword').value;
        const confirmPassword = document.getElementById('userConfirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'change_user_password');
        formData.append('user_id', selectedUserId);
        formData.append('new_password', newPassword);
        
        try {
            const response = await fetch('admin_api.php', { method: 'POST', body: formData });
            const text = await response.text();
            
            try {
                const result = JSON.parse(text);
                if (result.success) {
                    alert('User password changed successfully!');
                    closeUserPasswordModal();
                } else {
                    alert(result.message || 'Password change failed');
                }
            } catch (jsonError) {
                console.log('Server response:', text);
                alert('Server error. Check console for details.');
            }
        } catch (error) {
            alert('Error changing password: ' + error.message);
        }
    });
    
    // Load initial stats
    loadBookingStats();
    </script>
</body>
</html>