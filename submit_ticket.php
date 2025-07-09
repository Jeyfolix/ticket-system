<?php
header('Content-Type: application/json');
require_once '../backend/db.php'; // Adjust the path if needed

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
  exit;
}

// Sanitize input
$user_code = trim($_POST['user_id'] ?? '');
$role = trim($_POST['role'] ?? '');
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$priority = trim($_POST['priority'] ?? 'Medium');

if (!$user_code || !$name || !$email || !$subject) {
  echo json_encode(['success' => false, 'error' => 'All required fields must be filled.']);
  exit;
}

// Step 1: Check if user exists and has role 'User'
$stmt = $pdo->prepare("SELECT id FROM users WHERE user_id = ? AND role = 'User'");
$stmt->execute([$user_code]);
$user = $stmt->fetch();

if (!$user) {
  echo json_encode(['success' => false, 'error' => 'Invalid user ID or role is not User.']);
  exit;
}

$user_id = $user['id']; // This will go into `tickets.user_id` (foreign key)

// Step 2: Handle optional file upload
$attachmentPath = null;

if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
  $fileTmp = $_FILES['attachment']['tmp_name'];
  $fileName = $_FILES['attachment']['name'];
  $fileSize = $_FILES['attachment']['size'];
  $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

  $allowedExts = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

  if (in_array($fileExt, $allowedExts) && $fileSize <= 5 * 1024 * 1024) {
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $newName = uniqid('ticket_', true) . '.' . $fileExt;
    $destination = $uploadDir . $newName;

    if (move_uploaded_file($fileTmp, $destination)) {
      $attachmentPath = $destination;
    }
  }
}

// Step 3: Insert into tickets table
$insert = $pdo->prepare("
  INSERT INTO tickets (user_id, role, full_name, email, subject, priority, attachment)
  VALUES (?, ?, ?, ?, ?, ?, ?)
");

$insert->execute([
  $user_id,
  $role,
  $name,
  $email,
  $subject,
  $priority,
  $attachmentPath
]);

echo json_encode(['success' => true]);
exit;
?>
