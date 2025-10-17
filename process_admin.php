<?php
header("Content-Type: application/json");

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

// Include database connection
require_once __DIR__ . '/connection.php';

// Get POST data
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$password_confirm = isset($_POST['password_confirm']) ? $_POST['password_confirm'] : '';

// Server-side validation
$errors = [];
if ($username === '') $errors[] = "Username is required.";
if (strlen($password) < 8) $errors[] = "Password must be at least 8 characters.";
if ($password !== $password_confirm) $errors[] = "Passwords do not match.";

if (!empty($errors)) {
    echo json_encode(["status" => "error", "message" => $errors]);
    exit;
}

try {
    // Check if username already exists
    $stmt = $pdo->prepare("SELECT id FROM admins WHERE username = :username LIMIT 1");
    $stmt->execute([':username' => $username]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Username already exists."]);
        exit;
    }

    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert admin into the database
    $insert = $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES (:username, :password_hash)");
    $insert->execute([
        ':username' => $username,
        ':password_hash' => $password_hash
    ]);

    echo json_encode(["status" => "success", "message" => "Admin created successfully."]);
    exit;

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}
?>
