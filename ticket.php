<?php
// Start buffering to prevent any accidental output before JSON
ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(0);

require_once __DIR__ . '/connection.php';

// ✅ Collect input data
$fullname = trim($_POST['fullname'] ?? '');
$email = trim($_POST['email'] ?? '');
$regno = trim($_POST['regno'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$category = trim($_POST['category'] ?? '');
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$priority = trim($_POST['priority'] ?? '');
$attachmentPath = "";

// ✅ Validate all required fields
if (
    empty($fullname) || empty($email) || empty($regno) || empty($phone) ||
    empty($category) || empty($title) || empty($description) || empty($priority)
) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

// ✅ Handle file upload (optional)
if (!empty($_FILES['attachment']['name'])) {
    $targetDir = __DIR__ . '/../uploads/';
    if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);

    $fileName = time() . "_" . basename($_FILES["attachment"]["name"]);
    $targetFilePath = $targetDir . $fileName;

    if (move_uploaded_file($_FILES["attachment"]["tmp_name"], $targetFilePath)) {
        $attachmentPath = 'uploads/' . $fileName;
    }
}

try {
    // ✅ Check if student exists in `student` table
    $check = $pdo->prepare("SELECT * FROM student WHERE regno = :regno AND fullname = :fullname");
    $check->execute([':regno' => $regno, ':fullname' => $fullname]);
    $student = $check->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(['success' => false, 'message' => 'Student record not found. Please register first.']);
        exit;
    }

    // ✅ Insert ticket into `student_ticket` table
    $stmt = $pdo->prepare("
        INSERT INTO student_ticket (fullname, email, regno, phone, category, title, description, priority, attachment)
        VALUES (:fullname, :email, :regno, :phone, :category, :title, :description, :priority, :attachment)
    ");

    $success = $stmt->execute([
        ':fullname' => $fullname,
        ':email' => $email,
        ':regno' => $regno,
        ':phone' => $phone,
        ':category' => $category,
        ':title' => $title,
        ':description' => $description,
        ':priority' => $priority,
        ':attachment' => $attachmentPath
    ]);

    // ✅ Return success or failure message
    if ($success) {
        echo json_encode(['success' => true, 'message' => '✅ Ticket submitted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => '❌ Failed to submit ticket.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => '⚠️ Database Error: ' . $e->getMessage()]);
}

ob_end_flush();
?>
