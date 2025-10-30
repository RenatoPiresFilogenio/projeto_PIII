<?php
require("../../DB/database.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM marcas ORDER BY id_marca DESC";
    $stmt = $pdo->query($sql);
    $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'marcas' => $marcas
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao buscar marcas.',
        'error' => $e->getMessage()
    ]);
}
