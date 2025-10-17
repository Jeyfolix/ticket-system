<?php
header("Content-Type: application/json");

// Enable error reporting (for debugging)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

// Include DB connection
require_once __DIR__ . '/connection.php';

// Get POST data
$fullname = $_POST['fullname'] ?? '';
$email = $_POST['email'] ?? '';
$regno = $_POST['regno'] ?? '';
$phone = $_POST['phone'] ?? '';
$faculty = $_POST['faculty'] ?? '';
$department = $_POST['department'] ?? '';
$course = $_POST['course'] ?? '';
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
$errors = [];
if($fullname === '') $errors[] = "Full name is required";
if($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required";
if($regno === '') $errors[] = "Registration number is required";
if($phone === '' || !preg_match("/^[0-9]{10}$/", $phone)) $errors[] = "Valid 10-digit phone number required";
if($faculty === '') $errors[] = "Faculty is required";
if($department === '') $errors[] = "Department is required";
if($course === '') $errors[] = "Course is required";
if(strlen($password) < 6) $errors[] = "Password must be at least 6 characters";
if($password !== $confirm_password) $errors[] = "Passwords do not match";

if(!empty($errors)){
    echo json_encode(["status"=>"error","message"=>$errors]);
    exit;
}

try {
    // Check if regno or email exists
    $stmt = $pdo->prepare("SELECT id FROM student WHERE regno=:regno OR email=:email LIMIT 1");
    $stmt->execute([':regno'=>$regno, ':email'=>$email]);
    if($stmt->fetch()){
        echo json_encode(["status"=>"error","message"=>"Student with this registration number or email already exists"]);
        exit;
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert student
    $insert = $pdo->prepare("INSERT INTO student (fullname, email, regno, phone, faculty, department, course, password_hash) VALUES (:fullname, :email, :regno, :phone, :faculty, :department, :course, :password_hash)");
    $insert->execute([
        ':fullname'=>$fullname,
        ':email'=>$email,
        ':regno'=>$regno,
        ':phone'=>$phone,
        ':faculty'=>$faculty,
        ':department'=>$department,
        ':course'=>$course,
        ':password_hash'=>$password_hash
    ]);

    echo json_encode(["status"=>"success","message"=>"Student registered successfully"]);
    exit;

} catch(PDOException $e){
    echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
    exit;
}
