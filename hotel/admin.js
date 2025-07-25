// Get data from localStorage or redirect if not admin
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let users = JSON.parse(localStorage.getItem('users')) || [];
let bookings = JSON.parse(localStorage.getItem('bookings')) || [
    {
        id: 1,
        roomId: 1,
        roomName: "Forest View Cabin",
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        guestPhone: "+1234567890",
        checkin: "2024-01-15",
        checkout: "2024-01-18",
        guests: 2,
        total: 360,
        status: "confirmed",
        bookingDate: "2024-01-10"
    },
    {
        id: 2,
        roomId: 2,
        roomName: "Mountain Lodge",
        guestName: "Bob Johnson",
        guestEmail: "bob@example.com",
        guestPhone: "+0987654321",
        checkin: "2024-01-20",
        checkout: "2024-01-22",
        guests: 3,
        total: 500,
        status: "pending",
        bookingDate: "2024-01-12"
    }
];
let rooms = JSON.parse(localStorage.getItem('rooms')) || [
    {
        id: 1,
        name: "Forest View Cabin",
        price: 120,
        maxGuests: 2,
        features: ["Forest Views", "Fireplace", "Private Deck"],
        available: true,
        totalRooms: 1
    },
    {
        id: 2,
        name: "Mountain Lodge",
        price: 250,
        maxGuests: 4,
        features: ["Mountain Vista", "Hot Spring", "Hiking Trails"],
        available: true,
        totalRooms: 1
    },
    {
        id: 3,
        name: "Tree House Suite",
        price: 350,
        maxGuests: 3,
        features: ["Canopy Living", "Bird Watching", "Stargazing"],
        available: true,
        totalRooms: 1
    },
    {
        id: 4,
        name: "Lakeside Villa",
        price: 500,
        maxGuests: 6,
        features: ["Lake Access", "Kayaks", "Outdoor Spa"],
        available: true,
        totalRooms: 1
    }
];

// Check if user is admin, redirect if not
if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('userDisplayName').textContent = `Welcome, ${currentUser.name}`;
    document.getElementById('userInfo').style.display = 'block';
    loadBookings();
    loadAdminRooms();
    
    // Change password form
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
    
    // User password form
    document.getElementById('userPasswordForm').addEventListener('submit', handleUserPasswordChange);
    
    loadUsers();
    
    // Listen for storage changes (new bookings from user page)
    window.addEventListener('storage', function(e) {
        if (e.key === 'bookings') {
            bookings = JSON.parse(e.newValue) || [];
            loadBookings();
        }
    });
    
    // Also check for updates every 2 seconds
    setInterval(function() {
        const updatedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        if (updatedBookings.length !== bookings.length) {
            bookings = updatedBookings;
            loadBookings();
        }
    }, 2000);
});

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('bookings');
    localStorage.removeItem('rooms');
    window.location.href = 'index.html';
}

// Admin tab functions
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'bookings') {
        // Refresh bookings from localStorage
        bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        loadBookings();
    } else if (tabName === 'rooms') {
        loadAdminRooms();
    } else if (tabName === 'users') {
        loadUsers();
    }
}

// Cancel booking function
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        loadBookings();
        loadAdminRooms();
    }
}

// Load bookings for admin
function loadBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--moss-green);">No bookings found</td></tr>';
    } else {
        tbody.innerHTML = bookings.map(booking => `
            <tr>
                <td>#${booking.id}</td>
                <td>${booking.guestName}</td>
                <td>${booking.roomName}</td>
                <td>${booking.checkin}</td>
                <td>${booking.checkout}</td>
                <td>${booking.guests}</td>
                <td>$${booking.total}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
                <td><button onclick="cancelBooking(${booking.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Cancel</button></td>
            </tr>
        `).join('');
    }
}

// Check room availability for admin
function checkRoomAvailability() {
    rooms.forEach(room => {
        const roomBookings = bookings.filter(b => b.roomId === room.id && b.status === 'confirmed');
        room.available = roomBookings.length < room.totalRooms;
    });
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

// Generate calendar for room availability
function generateRoomCalendar(room, year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const roomBookings = bookings.filter(b => b.roomId === room.id && b.status === 'confirmed');
    
    let calendarHTML = `
        <div class="room-calendar">
            <h4>${room.name} - ${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
            <div class="calendar-grid">
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
    `;
    
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if date is booked
        const isBooked = roomBookings.some(booking => {
            const checkin = new Date(booking.checkin);
            const checkout = new Date(booking.checkout);
            return currentDate >= checkin && currentDate < checkout;
        });
        
        let dayClass = 'calendar-day ';
        if (!isCurrentMonth) {
            dayClass += 'other-month';
        } else if (isBooked) {
            dayClass += 'booked';
        } else {
            dayClass += 'available';
        }
        
        calendarHTML += `<div class="${dayClass}" title="${dateStr}">${currentDate.getDate()}</div>`;
    }
    
    calendarHTML += `
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
    `;
    
    return calendarHTML;
}

// Load rooms for admin
function loadAdminRooms() {
    checkRoomAvailability();
    const container = document.getElementById('roomCalendarContainer');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    container.innerHTML = rooms.map(room => 
        generateRoomCalendar(room, currentYear, currentMonth)
    ).join('');
}

// Handle password change
function handlePasswordChange(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Verify current password
    if (currentUser.password !== currentPassword) {
        alert('Current password is incorrect!');
        return;
    }
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    
    // Update in users array and localStorage
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    alert('Password changed successfully!');
    document.getElementById('changePasswordForm').reset();
}

let selectedUserId = null;

// Load users for admin
function loadUsers() {
    users = JSON.parse(localStorage.getItem('users')) || [];
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
                    ${user.id !== currentUser.id ? 
                        `<button onclick="openUserPasswordModal(${user.id})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Change Password</button>` :
                        `<span style="color: #999; font-size: 12px;">Current User</span>`
                    }
                </td>
            </tr>
        `).join('');
    }
}

// Open user password modal
function openUserPasswordModal(userId) {
    selectedUserId = userId;
    const user = users.find(u => u.id === userId);
    document.getElementById('selectedUserInfo').textContent = `Change password for: ${user.name} (${user.email})`;
    document.getElementById('userPasswordModal').style.display = 'block';
}

// Close user password modal
function closeUserPasswordModal() {
    document.getElementById('userPasswordModal').style.display = 'none';
    document.getElementById('userPasswordForm').reset();
    selectedUserId = null;
}

// Handle user password change
function handleUserPasswordChange(e) {
    e.preventDefault();
    const newPassword = document.getElementById('userNewPassword').value;
    const confirmPassword = document.getElementById('userConfirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Update user password
    const userIndex = users.findIndex(u => u.id === selectedUserId);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        alert(`Password changed successfully for ${users[userIndex].name}!`);
        closeUserPasswordModal();
        loadUsers();
    }
}