<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/connection.php';


header('Content-Type: application/json');

// Check if required fields are present
if (
    empty($_POST['fullname']) || empty($_POST['regno']) ||
    empty($_POST['email']) || empty($_POST['phone']) ||
    empty($_POST['category']) || empty($_POST['title']) ||
    empty($_POST['description']) || empty($_POST['priority'])
) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

$fullname = trim($_POST['fullname']);
$regno = trim($_POST['regno']);
$email = trim($_POST['email']);
$phone = trim($_POST['phone']);
$category = trim($_POST['category']);
$title = trim($_POST['title']);
$description = trim($_POST['description']);
$priority = trim($_POST['priority']);
$attachmentPath = "";

// ✅ Handle file upload
if (!empty($_FILES['attachment']['name'])) {
    $targetDir = "../uploads/";
    if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);

    $fileName = basename($_FILES["attachment"]["name"]);
    $targetFilePath = $targetDir . time() . "_" . $fileName;

    if (move_uploaded_file($_FILES["attachment"]["tmp_name"], $targetFilePath)) {
        $attachmentPath = $targetFilePath;
    }
}

try {
    // 🔹 Verify student exists
    $checkStmt = $conn->prepare("SELECT * FROM student WHERE regno = ? AND fullname = ?");
    $checkStmt->bind_param("ss", $regno, $fullname);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Student record not found. Please register first.']);
        exit;
    }

    // 🔹 Insert into student_ticket table
    $insertStmt = $conn->prepare("INSERT INTO student_ticket 
        (regno, fullname, email, phone, category, title, description, attachment, priority) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $insertStmt->bind_param("sssssssss",
        $regno, $fullname, $email, $phone, $category, $title, $description, $attachmentPath, $priority
    );

    if ($insertStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Ticket submitted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit ticket.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
