<?php
header("Content-Type: application/json"); // Output as JSON for clarity

$host = "localhost";
$dbname = "it_ticket_system";
$username = "folix";
$password = "jey2025";

$response = [];

try {
    // Try to establish the database connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // If successful
    $response["status"] = "success";
    $response["message"] = "✅ Connected successfully to the MySQL database!";
} catch (PDOException $e) {
    // If connection fails
    $response["status"] = "error";
    $response["message"] = "❌ Connection failed: " . $e->getMessage();
}

// Output the result as JSON
echo json_encode($response, JSON_PRETTY_PRINT);
?>
