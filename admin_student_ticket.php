<?php
// ✅ Enable error reporting for debugging (optional for development)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once __DIR__ . '/connection.php';

// ✅ Check if registration number is provided
if (empty($_GET['regno'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Registration number is required.'
    ]);
    exit;
}

$regno = trim($_GET['regno']);

try {
    // 🔍 Fetch the latest student ticket for the given registration number
    $stmt = $pdo->prepare("
        SELECT id, fullname, regno, email, phone, category, title, description, attachment, priority, created_at
        FROM student_ticket
        WHERE regno = :regno
        ORDER BY id DESC
        LIMIT 1
    ");
    $stmt->execute([':regno' => $regno]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($ticket) {
        echo json_encode([
            'success' => true,
            'data' => $ticket
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No ticket found for this registration number.'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
