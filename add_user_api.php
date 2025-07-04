<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once 'db.php'; // Assuming your PDO connection function is in config.php

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get and sanitize input data
    $userId     = sanitizeInput($_POST['userId'] ?? '');
    $name       = sanitizeInput($_POST['name'] ?? '');
    $email      = sanitizeInput($_POST['email'] ?? '');
    $role       = sanitizeInput($_POST['role'] ?? '');
    $phone      = sanitizeInput($_POST['phone'] ?? '');
    $department = sanitizeInput($_POST['department'] ?? '');
    $status     = sanitizeInput($_POST['status'] ?? 'active');
    $createdAt  = sanitizeInput($_POST['createdAt'] ?? '');
    $loginCount = (int)($_POST['loginCount'] ?? 0);

    // Validation
    $errors = [];

    if (empty($userId)) $errors[] = 'User ID is required';
    if (empty($name) || strlen($name) < 2) $errors[] = 'Full name must be at least 2 characters';
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email';
    if (empty($role)) $errors[] = 'Role is required';

    $allowedRoles = ['admin', 'user', 'moderator', 'guest'];
    if (!in_array($role, $allowedRoles)) $errors[] = 'Invalid role selected';

    $allowedStatuses = ['active', 'inactive', 'suspended'];
    if (!in_array($status, $allowedStatuses)) $errors[] = 'Invalid status selected';

    // Kenyan phone number validation
    if (!empty($phone) && !preg_match('/^(?:254|\+254|0)?7\d{8}$/', $phone)) {
        $errors[] = 'Invalid Kenyan phone number';
    }

    if (!empty($errors)) {
        echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
        exit;
    }

    $pdo = getConnection(); // From config.php

    // Check for existing user ID
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'User ID already exists']);
        exit;
    }

    // Check for existing email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email address already exists']);
        exit;
    }

    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users (
            user_id, name, email, role, phone, department, status, 
            login_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $result = $stmt->execute([
        $userId, $name, $email, $role, $phone, $department, $status, $loginCount, $createdAt
    ]);

    if ($result) {
        $insertedId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT id, user_id, name, email, role, status FROM users WHERE id = ?");
        $stmt->execute([$insertedId]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $userData
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create user']);
    }

} catch (PDOException $e) {
    error_log("PDO error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Unexpected error occurred']);
}
?>
