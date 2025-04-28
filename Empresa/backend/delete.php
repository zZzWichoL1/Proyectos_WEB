<?php
header('Content-Type: application/json');
require 'db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$table = $data['table'] ?? '';
$idField = $table === 'empleados' ? 'ID_Empleado' : 'ID_Puesto';
$allowed = ['empleados','puestos'];
if (!in_array($table, $allowed, true)) {
  http_response_code(400);
  exit(json_encode(['error'=>'Tabla no permitida']));
}

$sql = "DELETE FROM `$table` WHERE `$idField` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $data[$idField]); 
$success = $stmt->execute();
echo json_encode(['success'=>$success]);
