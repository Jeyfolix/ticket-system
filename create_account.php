<?php
require_once "db.php"; // use your provided PDO setup

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitize input
    $role = isset($_POST['role']) ? sanitizeInput($_POST['role']) : '';
    $user_id = isset($_POST['user_id']) ? sanitizeInput($_POST['user_id']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Validate
    if (empty($role) || empty($user_id) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    try {
        $pdo = getConnection();

        // 1. Check if user_id and role exist in `users` table
        $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = :user_id AND role = :role LIMIT 1");
        $stmt->execute(['user_id' => $user_id, 'role' => $role]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(["success" => false, "message" => "User ID and Role do not match any registered user."]);
            exit;
        }

        // 2. Check if account already exists
        $stmt = $pdo->prepare("SELECT * FROM account WHERE user_id = :user_id LIMIT 1");
        $stmt->execute(['user_id' => $user_id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "Account already exists for this User ID."]);
            exit;
        }

        // 3. Hash password and insert new account
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO account (user_id, role, password, created_at) VALUES (:user_id, :role, :password, NOW())");
        $stmt->execute([
            'user_id' => $user_id,
            'role' => $role,
            'password' => $hashedPassword
        ]);

        echo json_encode(["success" => true, "message" => "Account created successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
