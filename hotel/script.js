// Users database
let users = [
    {
        id: 1,
        email: 'user@hotel.com',
        password: 'user123',
        name: 'John Doe',
        role: 'user'
    },
    {
        id: 2,
        email: 'admin@hotel.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    }
];

let userIdCounter = users.length;
let isLoginMode = true;

// Rooms database
let rooms = [
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

// Bookings database
let bookings = [
    {
        id: 1,
        roomId: 1,
        roomName: "Forest View Cabin",
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        guestPhone: "+1234567890",
        checkin: "2025-07-04",
        checkout: "2025-07-06",
        guests: 2,
        total: 240,
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
        checkin: "2025-08-15",
        checkout: "2025-08-17",
        guests: 3,
        total: 500,
        status: "confirmed",
        bookingDate: "2024-01-12"
    }
];

let currentUser = null;
let selectedRoom = null;
let bookingCounter = bookings.length;
let appliedVoucher = null;
let finalTotal = 0;

// Voucher database
let vouchers = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', active: true },
    { code: 'SAVE50', discount: 50, type: 'fixed', active: true },
    { code: 'SUMMER20', discount: 20, type: 'percentage', active: true }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users in localStorage
    if (localStorage.getItem('users')) {
        users = JSON.parse(localStorage.getItem('users'));
    } else {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Initialize bookings in localStorage if not exists
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    } else {
        bookings = JSON.parse(localStorage.getItem('bookings'));
    }
    
    setMinDate();
    loadRooms();
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Sign up form
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Forgot password form
    document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);
    
    // Search form
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    
    // Booking form
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
});

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;
    
    document.getElementById('checkin').addEventListener('change', function() {
        document.getElementById('checkout').min = this.value;
    });
}

// Toggle between login and signup
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const subtitle = document.getElementById('authSubtitle');
    const switchText = document.getElementById('authSwitchText');
    const switchLink = document.getElementById('authSwitchLink');
    
    if (isLoginMode) {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        subtitle.textContent = 'Sign in to continue';
        switchText.textContent = "Don't have an account? ";
        switchLink.textContent = 'Sign up';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        subtitle.textContent = 'Create your account';
        switchText.textContent = 'Already have an account? ';
        switchLink.textContent = 'Sign in';
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('userDisplayName').textContent = `Welcome, ${user.name}`;
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        if (user.role === 'admin') {
            // Redirect to admin page
            window.location.href = 'admin.html';
        } else {
            document.getElementById('userContent').style.display = 'block';
            loadUserBookings();
        }
    } else {
        alert('Invalid credentials!');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: ++userIdCounter,
        email: email,
        password: password,
        name: name,
        role: 'user'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created successfully! Please sign in.');
    
    // Switch to login mode
    showLogin();
    document.getElementById('signupForm').reset();
}

// Handle forgot password
function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const user = users.find(u => u.email === email);
    if (!user) {
        alert('Email not found!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Update password
    user.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Password reset successful! You can now login with your new password.');
    showLogin();
    document.getElementById('forgotForm').reset();
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'block';
    document.getElementById('authSubtitle').textContent = 'Reset your password';
}

// Show login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'none';
    document.getElementById('authSubtitle').textContent = 'Sign in to continue';
    document.getElementById('authSwitchText').textContent = "Don't have an account? ";
    document.getElementById('authSwitchLink').textContent = 'Sign up';
    isLoginMode = true;
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('bookings');
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('userContent').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    
    // Reset to login mode
    if (!isLoginMode) {
        toggleAuthMode();
    }
}

// Check room availability for specific dates
function checkRoomAvailability(checkinDate, checkoutDate) {
    rooms.forEach(room => {
        if (checkinDate && checkoutDate) {
            const conflictingBookings = bookings.filter(booking => {
                if (booking.roomId !== room.id || booking.status !== 'confirmed') return false;
                
                const bookingCheckin = new Date(booking.checkin);
                const bookingCheckout = new Date(booking.checkout);
                const searchCheckin = new Date(checkinDate);
                const searchCheckout = new Date(checkoutDate);
                
                return (searchCheckin < bookingCheckout && searchCheckout > bookingCheckin);
            });
            room.available = conflictingBookings.length < room.totalRooms;
        } else {
            const roomBookings = bookings.filter(b => b.roomId === room.id && b.status === 'confirmed');
            room.available = roomBookings.length < room.totalRooms;
        }
    });
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

// Load rooms for users
function loadRooms() {
    checkRoomAvailability();
    const grid = document.getElementById('roomsGrid');
    grid.innerHTML = rooms.map(room => `
        <div class="room-card ${!room.available ? 'unavailable' : ''}">
            <div class="room-image">${room.name}</div>
            <div class="room-content">
                <div class="room-title">${room.name}</div>
                <div class="room-price">$${room.price}/night</div>
                <div class="room-features">
                    ${room.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
                <div style="font-size: 14px; margin-bottom: 15px; color: var(--moss-green);">Max ${room.maxGuests} guests</div>
                ${room.available ? 
                    `<button class="book-btn" onclick="openBookingModal(${room.id})">Book Now</button>` :
                    `<button class="book-btn" style="background: #ccc; cursor: not-allowed;" disabled>SOLD OUT</button>`
                }
            </div>
        </div>
    `).join('');
}

// Handle search
function handleSearch(e) {
    e.preventDefault();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = parseInt(document.getElementById('guests').value);
    
    if (!checkin || !checkout) {
        alert('Please select check-in and check-out dates');
        return;
    }
    
    if (new Date(checkin) >= new Date(checkout)) {
        alert('Check-out date must be after check-in date');
        return;
    }
    
    // Show loading animation
    const grid = document.getElementById('roomsGrid');
    const loading = document.getElementById('searchLoading');
    
    grid.style.display = 'none';
    loading.style.display = 'block';
    
    // Simulate search with animation
    setTimeout(() => {
        checkRoomAvailability(checkin, checkout);
        
        const availableRooms = rooms.filter(room => room.maxGuests >= guests);
        
        loading.style.display = 'none';
        grid.style.display = 'grid';
        
        if (availableRooms.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--moss-green); font-size: 18px; grid-column: 1/-1;">No rooms available for your criteria.</p>';
        } else {
            grid.innerHTML = availableRooms.map((room, index) => `
                <div class="room-card ${!room.available ? 'unavailable' : ''}" style="animation-delay: ${index * 0.1}s">
                    <div class="room-image">${room.name}</div>
                    <div class="room-content">
                        <div class="room-title">${room.name}</div>
                        <div class="room-price">$${room.price}/night</div>
                        <div class="room-features">
                            ${room.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                        </div>
                        <div style="font-size: 14px; margin-bottom: 15px; color: var(--moss-green);">Max ${room.maxGuests} guests</div>
                        ${room.available ? 
                            `<button class="book-btn" onclick="openBookingModal(${room.id})">Book Now</button>` :
                            `<button class="book-btn" style="background: #ccc; cursor: not-allowed;" disabled>SOLD OUT (${checkin} - ${checkout})</button>`
                        }
                    </div>
                </div>
            `).join('');
        }
    }, 2000);
}

// Open booking modal
function openBookingModal(roomId) {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    selectedRoom = rooms.find(r => r.id === roomId);
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    
    if (!checkin || !checkout) {
        alert('Please select check-in and check-out dates first');
        return;
    }
    
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    const total = nights * selectedRoom.price;
    
    document.getElementById('selectedRoomInfo').innerHTML = `
        ${selectedRoom.name} - ${guests} guest(s)<br>
        ${checkin} to ${checkout} (${nights} nights)<br>
        <strong>Total: $${total}</strong>
    `;
    
    document.getElementById('bookingModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('bookingForm').reset();
    document.getElementById('paymentForm').reset();
    appliedVoucher = null;
    finalTotal = 0;
}

// Apply voucher
function applyVoucher() {
    const code = document.getElementById('voucherCode').value.toUpperCase();
    const voucher = vouchers.find(v => v.code === code && v.active);
    const messageDiv = document.getElementById('voucherMessage');
    
    if (!code) {
        messageDiv.innerHTML = '<span style="color: #dc3545;">Please enter a voucher code</span>';
        return;
    }
    
    if (voucher) {
        appliedVoucher = voucher;
        messageDiv.innerHTML = `<span style="color: #28a745;">✓ Voucher applied! ${voucher.type === 'percentage' ? voucher.discount + '% off' : '$' + voucher.discount + ' off'}</span>`;
    } else {
        messageDiv.innerHTML = '<span style="color: #dc3545;">Invalid or expired voucher code</span>';
        appliedVoucher = null;
    }
}

// Proceed to payment
function proceedToPayment() {
    const guestName = document.getElementById('guestName').value;
    const guestEmail = document.getElementById('guestEmail').value;
    const guestPhone = document.getElementById('guestPhone').value;
    
    if (!guestName || !guestEmail || !guestPhone) {
        alert('Please fill in all required fields');
        return;
    }
    
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    let total = nights * selectedRoom.price;
    
    // Apply voucher discount
    if (appliedVoucher) {
        if (appliedVoucher.type === 'percentage') {
            total = total * (1 - appliedVoucher.discount / 100);
        } else {
            total = Math.max(0, total - appliedVoucher.discount);
        }
    }
    
    finalTotal = total;
    
    // Show payment form
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'block';
    
    // Update final booking info
    document.getElementById('finalBookingInfo').innerHTML = `
        <div class="booking-summary">
            <h4>Booking Summary</h4>
            <p><strong>Room:</strong> ${selectedRoom.name}</p>
            <p><strong>Dates:</strong> ${checkin} to ${checkout} (${nights} nights)</p>
            <p><strong>Guests:</strong> ${guests}</p>
            <p><strong>Room Rate:</strong> $${selectedRoom.price}/night</p>
            <p><strong>Subtotal:</strong> $${nights * selectedRoom.price}</p>
            ${appliedVoucher ? `<p><strong>Discount (${appliedVoucher.code}):</strong> -$${(nights * selectedRoom.price) - total}</p>` : ''}
            <p class="total-amount"><strong>Total Amount: $${total.toFixed(2)}</strong></p>
        </div>
    `;
    
    // Pre-fill card name with guest name
    document.getElementById('cardName').value = guestName;
}

// Back to booking form
function backToBooking() {
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
}

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Payment form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
    
    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

// Handle payment
function handlePayment(e) {
    e.preventDefault();
    
    // Simulate payment processing
    const payBtn = document.querySelector('.pay-btn');
    payBtn.textContent = 'Processing...';
    payBtn.disabled = true;
    
    setTimeout(() => {
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const guests = parseInt(document.getElementById('guests').value);
        
        const booking = {
            id: ++bookingCounter,
            roomId: selectedRoom.id,
            roomName: selectedRoom.name,
            guestName: document.getElementById('guestName').value,
            guestEmail: document.getElementById('guestEmail').value,
            guestPhone: document.getElementById('guestPhone').value,
            checkin: checkin,
            checkout: checkout,
            guests: guests,
            total: finalTotal,
            originalTotal: Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)) * selectedRoom.price,
            voucher: appliedVoucher ? appliedVoucher.code : null,
            status: 'confirmed',
            bookingDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Credit Card',
            cardLast4: document.getElementById('cardNumber').value.slice(-4)
        };
        
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Update displays
        loadUserBookings();
        loadRooms();
        
        // Show success message
        document.getElementById('paymentForm').style.display = 'none';
        document.getElementById('bookingReference').innerHTML = `<strong>Booking Reference: #${booking.id}</strong>`;
        document.getElementById('successMessage').style.display = 'block';
        
        // Reset button
        payBtn.textContent = 'Complete Payment';
        payBtn.disabled = false;
        
        setTimeout(() => {
            closeModal();
        }, 5000);
    }, 2000);
}

// Download voucher
function downloadVoucher() {
    const booking = bookings[bookings.length - 1]; // Get the latest booking
    const voucherContent = `
        NATURE RETREAT BOOKING VOUCHER
        ================================
        
        Booking ID: #${booking.id}
        Guest Name: ${booking.guestName}
        Room: ${booking.roomName}
        Check-in: ${booking.checkin}
        Check-out: ${booking.checkout}
        Guests: ${booking.guests}
        Total Paid: $${booking.total.toFixed(2)}
        ${booking.voucher ? `Voucher Applied: ${booking.voucher}` : ''}
        
        Thank you for choosing Nature Retreat!
        
        Please present this voucher at check-in.
    `;
    
    const blob = new Blob([voucherContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-voucher-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Open checkout modal
function openCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'block';
}

// Close checkout modal
function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.getElementById('checkoutForm').reset();
    document.getElementById('checkoutSuccess').style.display = 'none';
}

// Handle checkout
function handleCheckout(e) {
    e.preventDefault();
    
    const bookingId = document.getElementById('checkoutBookingId').value;
    const email = document.getElementById('checkoutEmail').value;
    
    const booking = bookings.find(b => b.id == bookingId && b.guestEmail === email);
    
    if (!booking) {
        alert('Booking not found. Please check your booking ID and email.');
        return;
    }
    
    if (booking.status === 'checked-out') {
        alert('This booking has already been checked out.');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (today < booking.checkin) {
        alert('Check-out is not available before your check-in date.');
        return;
    }
    
    // Update booking status
    booking.status = 'checked-out';
    booking.checkoutDate = today;
    
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Show success message
    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('checkoutSuccess').style.display = 'block';
    
    // Update user bookings if current user matches
    if (currentUser && currentUser.email === email) {
        loadUserBookings();
    }
    
    setTimeout(() => {
        closeCheckoutModal();
    }, 3000);
}

// Quick checkout from bookings table
function quickCheckout(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found.');
        return;
    }
    
    if (booking.status === 'checked-out') {
        alert('This booking has already been checked out.');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (today < booking.checkin) {
        alert('Check-out is not available before your check-in date.');
        return;
    }
    
    if (confirm(`Check-out from ${booking.roomName}?`)) {
        booking.status = 'checked-out';
        booking.checkoutDate = today;
        
        localStorage.setItem('bookings', JSON.stringify(bookings));
        loadUserBookings();
        
        alert('Check-out successful! Thank you for staying with us.');
    }
}



// Cancel user booking
function cancelUserBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    const checkinDate = new Date(booking.checkin);
    const today = new Date();
    const daysDiff = Math.ceil((checkinDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 3) {
        alert('Cannot cancel booking. Cancellation must be at least 3 days before check-in date.');
        return;
    }
    
    if (confirm('Are you sure you want to cancel this booking?')) {
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        checkRoomAvailability();
        loadUserBookings();
        loadRooms();
    }
}

// Load user bookings
function loadUserBookings() {
    const tbody = document.getElementById('userBookingsTableBody');
    const userBookings = bookings.filter(booking => 
        booking.guestEmail === currentUser.email
    );
    
    if (userBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--moss-green);">No bookings found</td></tr>';
    } else {
        tbody.innerHTML = userBookings.map(booking => {
            const checkinDate = new Date(booking.checkin);
            const today = new Date();
            const daysDiff = Math.ceil((checkinDate - today) / (1000 * 60 * 60 * 24));
            const canCancel = daysDiff >= 3;
            
            return `
                <tr>
                    <td>#${booking.id}</td>
                    <td>${booking.roomName}</td>
                    <td>${booking.checkin}</td>
                    <td>${booking.checkout}</td>
                    <td>${booking.guests}</td>
                    <td>$${booking.total}</td>
                    <td><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
                    <td>
                        ${canCancel && booking.status !== 'checked-out' ? 
                            `<button onclick="cancelUserBooking(${booking.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 5px;">Cancel</button>` :
                            `<span style="color: #999; font-size: 12px;">Cannot cancel</span>`
                        }
                        ${booking.status === 'confirmed' && today >= booking.checkin ? 
                            `<button onclick="quickCheckout(${booking.id})" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Check-out</button>` :
                            ''
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }
}