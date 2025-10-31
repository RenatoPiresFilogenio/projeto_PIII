<?php
require("../../DB/database.php");

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_GET['id_fornecedor'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'ID do fornecedor não fornecido.'
    ]);
    exit;
}

$id_fornecedor = $_GET['id_fornecedor'];

try {
   
    $sql = "SELECT p.*, 
                   m.nome AS nome_marca, 
                   m.modelo AS modelo_marca, 
                   m.site_oficial, 
                   m.pais_origem
            FROM produtos p
            JOIN marcas m ON p.fk_marcas_id = m.id_marca  
            WHERE m.id_marca = ?       
            ORDER BY p.id_produto DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_fornecedor]);

    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'produtos' => $produtos
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao buscar produtos.',
        'error' => $e->getMessage()
    ]);
}
