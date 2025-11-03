<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM kits";

    $stmt = $pdo->query($sql);
    $kits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'produtos' => $kits
    ]);
    exit();
} catch (\Throwable $th) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao consultar o banco de dados: ' . $th->getMessage()]);
    exit();
}
