<?php
require_once 'config.php';

echo "<h2>Session Debug</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

if (isset($_SESSION['user_role'])) {
    echo "<p>User is logged in as: " . $_SESSION['user_role'] . "</p>";
    echo "<p>User name: " . $_SESSION['user_name'] . "</p>";
} else {
    echo "<p>No active session</p>";
}
?>