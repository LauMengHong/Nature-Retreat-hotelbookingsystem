let currentUser = null;
let selectedUserId = null;

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadBookings();
    loadAdminRooms();
    loadUsers();
    loadVouchers();
    
    // Event listeners
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
    document.getElementById('userPasswordForm').addEventListener('submit', handleUserPasswordChange);
});

// Check admin authentication
async function checkAdminAuth() {
    try {
        const response = await fetch('check_admin.php');
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            document.getElementById('userDisplayName').textContent = `Welcome, ${result.user.name}`;
            document.getElementById('userInfo').style.display = 'block';
        } else {
            document.getElementById('userDisplayName').textContent = 'Please login as admin';
            document.getElementById('userInfo').style.display = 'block';
            console.log('Not authenticated as admin');
        }
    } catch (error) {
        document.getElementById('userDisplayName').textContent = 'Authentication error';
        document.getElementById('userInfo').style.display = 'block';
        console.log('Auth error:', error);
    }
}

// Tab functions
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'bookings') {
        loadBookings();
    } else if (tabName === 'rooms') {
        loadAdminRooms();
    } else if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'vouchers') {
        loadVouchers();
    }
}

// Load all bookings
async function loadBookings() {
    try {
        const response = await fetch('admin_api.php?action=get_all_bookings');
        const bookings = await response.json();
        
        const tbody = document.getElementById('bookingsTableBody');
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--moss-green);">No bookings found</td></tr>';
        } else {
            tbody.innerHTML = bookings.map(booking => `
                <tr>
                    <td>#${booking.id}</td>
                    <td>${booking.guest_name}</td>
                    <td>${booking.room_name}</td>
                    <td>${booking.checkin_date}</td>
                    <td>${booking.checkout_date}</td>
                    <td>${booking.guests}</td>
                    <td>$${booking.final_total}</td>
                    <td><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
                    <td>
                        <select onchange="updateBookingStatus(${booking.id}, this.value)" style="padding: 5px; border-radius: 5px;">
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="checked-out" ${booking.status === 'checked-out' ? 'selected' : ''}>Checked-out</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load bookings');
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    const formData = new FormData();
    formData.append('action', 'update_booking_status');
    formData.append('booking_id', bookingId);
    formData.append('status', status);
    
    try {
        const response = await fetch('admin_api.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            loadBookings();
        } else {
            alert('Failed to update booking status');
        }
    } catch (error) {
        alert('Error updating booking status');
    }
}

// Load rooms
async function loadAdminRooms() {
    try {
        const response = await fetch('admin_api.php?action=get_rooms');
        const rooms = await response.json();
        
        const container = document.getElementById('roomCalendarContainer');
        container.innerHTML = `
            <div class="booking-section">
                <h4>Add New Room</h4>
                <form id="addRoomForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <input type="text" id="roomName" placeholder="Room Name" required>
                    <input type="number" id="roomPrice" placeholder="Price per night" step="0.01" required>
                    <input type="number" id="roomMaxGuests" placeholder="Max Guests" required>
                    <input type="text" id="roomFeatures" placeholder="Features (comma separated)" required>
                    <button type="submit" class="confirm-btn">Add Room</button>
                </form>
            </div>
            <div class="rooms-grid">
                ${rooms.map(room => `
                    <div class="room-card">
                        <div class="room-content">
                            <div class="room-title">${room.name}</div>
                            <div class="room-price">$${room.price}/night</div>
                            <div class="room-features">
                                ${room.features.split(',').map(f => `<span class="feature-tag">${f.trim()}</span>`).join('')}
                            </div>
                            <div style="font-size: 14px; color: var(--moss-green);">Max ${room.max_guests} guests</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Re-attach event listener
        document.getElementById('addRoomForm').addEventListener('submit', handleAddRoom);
    } catch (error) {
        console.error('Failed to load rooms');
    }
}

// Add new room
async function handleAddRoom(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'add_room');
    formData.append('name', document.getElementById('roomName').value);
    formData.append('price', document.getElementById('roomPrice').value);
    formData.append('max_guests', document.getElementById('roomMaxGuests').value);
    formData.append('features', document.getElementById('roomFeatures').value);
    
    try {
        const response = await fetch('admin_api.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            alert('Room added successfully');
            loadAdminRooms();
        } else {
            alert('Failed to add room');
        }
    } catch (error) {
        alert('Error adding room');
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('admin_api.php?action=get_users');
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--moss-green);">No users found</td></tr>';
        } else {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status-badge status-${user.role === 'admin' ? 'pending' : 'confirmed'}">${user.role.toUpperCase()}</span></td>
                    <td>
                        <button onclick="openUserPasswordModal(${user.id})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Change Password</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load users');
    }
}

// Load vouchers
async function loadVouchers() {
    try {
        const response = await fetch('admin_api.php?action=get_vouchers');
        const vouchers = await response.json();
        
        const container = document.getElementById('vouchersContainer');
        container.innerHTML = `
            <div class="booking-section">
                <h4>Add New Voucher</h4>
                <form id="addVoucherForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <input type="text" id="voucherCode" placeholder="Voucher Code" required>
                    <input type="number" id="voucherDiscount" placeholder="Discount Amount" step="0.01" required>
                    <select id="voucherType" required>
                        <option value="">Select Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                    </select>
                    <button type="submit" class="confirm-btn">Add Voucher</button>
                </form>
            </div>
            <table class="bookings-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${vouchers.map(voucher => `
                        <tr>
                            <td><strong>${voucher.code}</strong></td>
                            <td>${voucher.discount}${voucher.type === 'percentage' ? '%' : '$'}</td>
                            <td>${voucher.type}</td>
                            <td><span class="status-badge status-${voucher.active ? 'confirmed' : 'cancelled'}">${voucher.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                            <td>${new Date(voucher.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        // Re-attach event listener
        document.getElementById('addVoucherForm').addEventListener('submit', handleAddVoucher);
    } catch (error) {
        console.error('Failed to load vouchers');
    }
}

// Add new voucher
async function handleAddVoucher(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'add_voucher');
    formData.append('code', document.getElementById('voucherCode').value.toUpperCase());
    formData.append('discount', document.getElementById('voucherDiscount').value);
    formData.append('type', document.getElementById('voucherType').value);
    
    try {
        const response = await fetch('admin_api.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            alert('Voucher added successfully');
            loadVouchers();
        } else {
            alert('Failed to add voucher');
        }
    } catch (error) {
        alert('Error adding voucher');
    }
}

// Open user password modal
function openUserPasswordModal(userId) {
    selectedUserId = userId;
    document.getElementById('userPasswordModal').style.display = 'block';
}

// Close user password modal
function closeUserPasswordModal() {
    document.getElementById('userPasswordModal').style.display = 'none';
    document.getElementById('userPasswordForm').reset();
    selectedUserId = null;
}

// Handle user password change
async function handleUserPasswordChange(e) {
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
        const result = await response.json();
        
        if (result.success) {
            alert('Password changed successfully!');
            closeUserPasswordModal();
        } else {
            alert('Failed to change password');
        }
    } catch (error) {
        alert('Error changing password');
    }
}

// Handle admin password change
async function handlePasswordChange(e) {
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
        const result = await response.json();
        
        if (result.success) {
            alert('Password changed successfully!');
            document.getElementById('changePasswordForm').reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error changing password');
    }
}

// Logout
async function logout() {
    try {
        const formData = new FormData();
        formData.append('action', 'logout');
        await fetch('auth.php', { method: 'POST', body: formData });
        window.location.href = 'index.html';
    } catch (error) {
        window.location.href = 'index.html';
    }
}