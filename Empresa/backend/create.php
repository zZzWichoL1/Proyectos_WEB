<?php
header('Content-Type: application/json');
require 'db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$table = $data['table'] ?? '';
$allowed = ['empleados','puestos'];
if (!in_array($table, $allowed, true)) {
  http_response_code(400);
  exit(json_encode(['error'=>'Tabla no permitida']));
}

if ($table === 'empleados') {
  $sql = "INSERT INTO empleados
    (Clave_Empleado, Nombre, A_paterno, A_materno, ID_Puesto, Fecha_Ingreso, Fecha_Baja, Estatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("isssisss",
    $data['Clave_Empleado'], $data['Nombre'], $data['A_paterno'],
    $data['A_materno'], $data['ID_Puesto'], $data['Fecha_Ingreso'],
    $data['Fecha_Baja'], $data['Estatus']
  ); 
}
else {
  $sql = "INSERT INTO puestos (Puesto) VALUES (?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $data['Puesto']); 
}
$success = $stmt->execute();
echo json_encode(['success'=>$success, 'id'=>$conn->insert_id]);
