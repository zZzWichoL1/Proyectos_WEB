<?php
header('Content-Type: application/json');
require 'db.php';

$table = $_GET['table'] ?? '';
$allowed = ['empleados','puestos'];
if (!in_array($table, $allowed, true)) {
  http_response_code(400);
  exit(json_encode(['error'=>'Tabla no permitida']));
}

$sql    = "SELECT * FROM `$table`";
$result = $conn->query($sql);
$rows   = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
