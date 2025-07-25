let currentUser = null;
let selectedRoom = null;
let appliedVoucher = null;
let finalTotal = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setMinDate();
    loadRooms();
    
    // Event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    
    // Card formatting
    formatCardInputs();
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

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('email', document.getElementById('loginEmail').value);
    formData.append('password', document.getElementById('loginPassword').value);
    
    try {
        const response = await fetch('auth.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('userDisplayName').textContent = `Welcome, ${result.user.name}`;
            
            if (result.user.role === 'admin') {
                window.location.href = 'direct_admin.php';
            } else {
                document.getElementById('userContent').style.display = 'block';
                loadUserBookings();
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Login failed');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', 'signup');
    formData.append('name', document.getElementById('signupName').value);
    formData.append('email', document.getElementById('signupEmail').value);
    formData.append('password', document.getElementById('signupPassword').value);
    
    try {
        const response = await fetch('auth.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            alert('Account created successfully! Please sign in.');
            showLogin();
            document.getElementById('signupForm').reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Registration failed');
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'forgot_password');
    formData.append('email', email);
    formData.append('new_password', newPassword);
    
    try {
        const response = await fetch('auth.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            alert('Password reset successful! You can now login with your new password.');
            showLogin();
            document.getElementById('forgotForm').reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Password reset failed');
    }
}

// Load rooms
async function loadRooms(checkin = null, checkout = null, guests = null) {
    try {
        let url = 'booking.php?action=get_rooms';
        if (checkin && checkout) {
            url += `&checkin=${checkin}&checkout=${checkout}`;
        }
        
        const response = await fetch(url);
        let rooms = await response.json();
        
        // Filter rooms by guest capacity
        if (guests) {
            rooms = rooms.filter(room => room.max_guests >= parseInt(guests));
        }
        
        const grid = document.getElementById('roomsGrid');
        const roomImages = {
            'Forest View Cabin': 'images/forest-cabin.jpg',
            'Mountain Lodge': 'images/mountain-lodge.jpg', 
            'Tree House Suite': 'images/tree-house.jpg',
            'Lakeside Villa': 'images/lakeside-villa.jpg'
        };
        
        if (rooms.length === 0) {
            grid.innerHTML = `<p style="text-align: center; color: var(--moss-green); font-size: 18px; grid-column: 1/-1;">No rooms available for ${guests} guests.</p>`;
        } else {
            grid.innerHTML = rooms.map(room => `
                <div class="room-card ${!room.available ? 'unavailable' : ''}">
                    <div class="room-image" style="background-image: url('${roomImages[room.name]}'); background-size: cover; background-position: center;"></div>
                    <div class="room-content">
                        <div class="room-title">${room.name}</div>
                        <div class="room-price">$${room.price}/night</div>
                        <div class="room-features">
                            ${room.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                        </div>
                        <div style="font-size: 14px; margin-bottom: 15px; color: var(--moss-green);">Max ${room.max_guests} guests</div>
                        ${room.available ? 
                            `<button class="book-btn" onclick="openBookingModal(${room.id})">Book Now</button>` :
                            `<button class="book-btn" style="background: #ccc; cursor: not-allowed;" disabled>SOLD OUT</button>`
                        }
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load rooms');
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (!checkin || !checkout) {
        alert('Please select check-in and check-out dates');
        return;
    }
    
    if (new Date(checkin) >= new Date(checkout)) {
        alert('Check-out date must be after check-in date');
        return;
    }
    
    const grid = document.getElementById('roomsGrid');
    const loading = document.getElementById('searchLoading');
    
    grid.style.display = 'none';
    loading.style.display = 'block';
    
    const guests = document.getElementById('guests').value;
    
    setTimeout(async () => {
        await loadRooms(checkin, checkout, guests);
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }, 1000);
}

// Apply voucher
async function applyVoucher() {
    const code = document.getElementById('voucherCode').value.toUpperCase();
    const messageDiv = document.getElementById('voucherMessage');
    
    if (!code) {
        messageDiv.innerHTML = '<span style="color: #dc3545;">Please enter a voucher code</span>';
        return;
    }
    
    try {
        const response = await fetch(`booking.php?action=apply_voucher&code=${code}`);
        const result = await response.json();
        
        if (result.success) {
            appliedVoucher = result.voucher;
            messageDiv.innerHTML = `<span style="color: #28a745;">✓ Voucher applied! ${result.voucher.type === 'percentage' ? result.voucher.discount + '% off' : '$' + result.voucher.discount + ' off'}</span>`;
        } else {
            messageDiv.innerHTML = '<span style="color: #dc3545;">Invalid or expired voucher code</span>';
            appliedVoucher = null;
        }
    } catch (error) {
        messageDiv.innerHTML = '<span style="color: #dc3545;">Error applying voucher</span>';
    }
}

// Handle payment
async function handlePayment(e) {
    e.preventDefault();
    
    const payBtn = document.querySelector('.pay-btn');
    payBtn.textContent = 'Processing...';
    payBtn.disabled = true;
    
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = parseInt(document.getElementById('guests').value);
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    const originalTotal = nights * selectedRoom.price;
    
    let discountAmount = 0;
    if (appliedVoucher) {
        if (appliedVoucher.type === 'percentage') {
            discountAmount = originalTotal * (appliedVoucher.discount / 100);
        } else {
            discountAmount = Math.min(appliedVoucher.discount, originalTotal);
        }
    }
    
    const formData = new FormData();
    formData.append('action', 'create_booking');
    formData.append('room_id', selectedRoom.id);
    formData.append('guest_name', document.getElementById('guestName').value);
    formData.append('guest_email', document.getElementById('guestEmail').value);
    formData.append('guest_phone', document.getElementById('guestPhone').value);
    formData.append('checkin_date', checkin);
    formData.append('checkout_date', checkout);
    formData.append('guests', guests);
    formData.append('original_total', originalTotal);
    formData.append('discount_amount', discountAmount);
    formData.append('final_total', finalTotal);
    formData.append('voucher_code', appliedVoucher ? appliedVoucher.code : '');
    formData.append('card_last4', document.getElementById('cardNumber').value.slice(-4));
    
    try {
        const response = await fetch('booking.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('paymentForm').style.display = 'none';
            document.getElementById('bookingReference').innerHTML = `<strong>Booking Reference: #${result.booking_id}</strong>`;
            document.getElementById('successMessage').style.display = 'block';
            
            loadUserBookings();
            loadRooms();
            
            setTimeout(() => closeModal(), 5000);
        } else {
            alert('Booking failed: ' + result.message);
        }
    } catch (error) {
        alert('Payment processing failed');
    }
    
    payBtn.textContent = 'Complete Payment';
    payBtn.disabled = false;
}

// Load user bookings
async function loadUserBookings() {
    try {
        const response = await fetch('booking.php?action=get_bookings');
        const result = await response.json();
        
        if (result.success === false) {
            console.error('Failed to load bookings');
            return;
        }
        
        const tbody = document.getElementById('userBookingsTableBody');
        const bookings = result;
        
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--moss-green);">No bookings found</td></tr>';
        } else {
            tbody.innerHTML = bookings.map(booking => {
                const checkinDate = new Date(booking.checkin_date);
                const today = new Date();
                const daysDiff = Math.ceil((checkinDate - today) / (1000 * 60 * 60 * 24));
                const canCancel = daysDiff >= 3 && booking.status === 'confirmed';
                
                return `
                    <tr>
                        <td>#${booking.id}</td>
                        <td>${booking.room_name}</td>
                        <td>${booking.checkin_date}</td>
                        <td>${booking.checkout_date}</td>
                        <td>${booking.guests}</td>
                        <td>$${booking.final_total}</td>
                        <td><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
                        <td>
                            ${canCancel ? 
                                `<button onclick="cancelUserBooking(${booking.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 5px;">Cancel</button>` :
                                `<span style="color: #999; font-size: 12px;">Cannot cancel</span>`
                            }
                            ${booking.status === 'confirmed' && today.toISOString().split('T')[0] >= booking.checkin_date ? 
                                `<button onclick="quickCheckout(${booking.id})" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Check-out</button>` :
                                ''
                            }
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Failed to load user bookings');
    }
}

// Cancel booking
async function cancelUserBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const formData = new FormData();
    formData.append('action', 'cancel_booking');
    formData.append('booking_id', bookingId);
    formData.append('guest_email', currentUser.email);
    
    try {
        const response = await fetch('booking.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            loadUserBookings();
            loadRooms();
            alert('Booking cancelled successfully');
        } else {
            alert('Cancellation failed: ' + result.message);
        }
    } catch (error) {
        alert('Cancellation failed');
    }
}

// Quick checkout
async function quickCheckout(bookingId) {
    if (!confirm('Check-out now?')) return;
    
    const formData = new FormData();
    formData.append('action', 'checkout');
    formData.append('booking_id', bookingId);
    formData.append('guest_email', currentUser.email);
    
    try {
        const response = await fetch('booking.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            loadUserBookings();
            alert('Check-out successful! Thank you for staying with us.');
        } else {
            alert('Check-out failed: ' + result.message);
        }
    } catch (error) {
        alert('Check-out failed');
    }
}

// Handle checkout form
async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'checkout');
    formData.append('booking_id', document.getElementById('checkoutBookingId').value);
    formData.append('guest_email', document.getElementById('checkoutEmail').value);
    
    try {
        const response = await fetch('booking.php', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('checkoutSuccess').style.display = 'block';
            
            if (currentUser) loadUserBookings();
            
            setTimeout(() => closeCheckoutModal(), 3000);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Check-out failed');
    }
}

// Utility functions
function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const subtitle = document.getElementById('authSubtitle');
    const switchText = document.getElementById('authSwitchText');
    const switchLink = document.getElementById('authSwitchLink');
    
    if (loginForm.style.display !== 'none') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        subtitle.textContent = 'Create your account';
        switchText.textContent = 'Already have an account? ';
        switchLink.textContent = 'Sign in';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        subtitle.textContent = 'Sign in to continue';
        switchText.textContent = "Don't have an account? ";
        switchLink.textContent = 'Sign up';
    }
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'block';
    document.getElementById('authSubtitle').textContent = 'Reset your password';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'none';
    document.getElementById('authSubtitle').textContent = 'Sign in to continue';
}

function openBookingModal(roomId) {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    selectedRoom = { id: roomId };
    // Find room details from loaded rooms
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        const bookBtn = card.querySelector('.book-btn');
        if (bookBtn && bookBtn.onclick.toString().includes(roomId)) {
            selectedRoom.name = card.querySelector('.room-title').textContent;
            selectedRoom.price = parseFloat(card.querySelector('.room-price').textContent.replace('$', '').replace('/night', ''));
        }
    });
    
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
    
    if (appliedVoucher) {
        if (appliedVoucher.type === 'percentage') {
            total = total * (1 - appliedVoucher.discount / 100);
        } else {
            total = Math.max(0, total - appliedVoucher.discount);
        }
    }
    
    finalTotal = total;
    
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'block';
    
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
    
    document.getElementById('cardName').value = guestName;
}

function backToBooking() {
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
}

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

function openCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.getElementById('checkoutForm').reset();
    document.getElementById('checkoutSuccess').style.display = 'none';
}

function downloadVoucher() {
    const voucherContent = `
        NATURE RETREAT BOOKING VOUCHER
        ================================
        
        Booking Reference: #${Date.now()}
        Guest Name: ${document.getElementById('guestName').value}
        Room: ${selectedRoom.name}
        Check-in: ${document.getElementById('checkin').value}
        Check-out: ${document.getElementById('checkout').value}
        Total Paid: $${finalTotal.toFixed(2)}
        
        Thank you for choosing Nature Retreat!
        Please present this voucher at check-in.
    `;
    
    const blob = new Blob([voucherContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-voucher-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function formatCardInputs() {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
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
    
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

async function logout() {
    try {
        const formData = new FormData();
        formData.append('action', 'logout');
        await fetch('auth.php', { method: 'POST', body: formData });
        
        currentUser = null;
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('userContent').style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        showLogin();
    } catch (error) {
        console.error('Logout failed');
    }
}