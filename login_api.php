<?php
require_once "db.php"; // Connect using your PDO config

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = isset($_POST['user_id']) ? sanitizeInput($_POST['user_id']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($user_id) || empty($password)) {
        echo json_encode(["success" => false, "message" => "User ID and Password are required."]);
        exit;
    }

    try {
        $pdo = getConnection();

        // Check if user exists
        $stmt = $pdo->prepare("SELECT * FROM account WHERE user_id = :user_id LIMIT 1");
        $stmt->execute(['user_id' => $user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user_id;
            echo json_encode(["success" => true, "message" => "Login successful."]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid credentials."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
