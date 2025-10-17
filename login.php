<?php
header("Content-Type: application/json");
session_start();

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status"=>"error","message"=>"Method not allowed"]);
    exit;
}

// Include DB connection
require_once __DIR__ . '/connection.php';

// Get POST data
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Validation
if($username === '' || $password === ''){
    echo json_encode(["status"=>"error","message"=>"Both fields are required"]);
    exit;
}

try {
    // Fetch user by regno
    $stmt = $pdo->prepare("SELECT * FROM student WHERE regno=:regno LIMIT 1");
    $stmt->execute([':regno'=>$username]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$student){
        echo json_encode(["status"=>"error","message"=>"Username not found"]);
        exit;
    }

    // Verify password
    if(password_verify($password, $student['password_hash'])){
        // Optionally, store session variables
        $_SESSION['student_id'] = $student['id'];
        $_SESSION['student_name'] = $student['fullname'];

        echo json_encode(["status"=>"success","message"=>"Login successful"]);
        exit;
    } else {
        echo json_encode(["status"=>"error","message"=>"Incorrect password"]);
        exit;
    }

} catch(PDOException $e){
    echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
    exit;
}
