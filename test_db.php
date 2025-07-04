<?php
require_once 'db.php';

try {
    $pdo = getConnection();
    echo "✅ PDO: Database connected successfully!";
} catch (PDOException $e) {
    echo "❌ PDO: Connection failed - " . $e->getMessage();
}
?>
