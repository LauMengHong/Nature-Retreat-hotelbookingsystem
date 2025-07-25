<?php
require_once 'config.php';

// Test admin login directly
$email = 'admin@hotel.com';
$password = 'admin123';

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
$stmt->execute([$email, $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    
    echo "<h2>Login Test Successful</h2>";
    echo "<p>User: " . $user['name'] . "</p>";
    echo "<p>Role: " . $user['role'] . "</p>";
    echo "<p><a href='admin.html'>Go to Admin Panel</a></p>";
} else {
    echo "<h2>Login Failed</h2>";
    echo "<p>User not found or wrong credentials</p>";
}
?>