<?php
require("../../DB/database.php");

header('Content-Type: application/json');

if (!isset($_GET['id_produto']) || !is_numeric($_GET['id_produto'])) {
    http_response_code(400); 
    echo json_encode([
        'status' => 'error',
        'message' => 'ID do produto inválido ou não fornecido.'
    ]);
    exit;
}

$id_produto = $_GET['id_produto'];

try {
   
    $sql = "SELECT p.*, m.nome AS nome_marca, m.modelo AS modelo_marca, m.site_oficial, m.pais_origem
            FROM produtos p
            JOIN marcas m ON p.fk_marcas_id_marca = m.id_marca
            WHERE p.id_produto = ?";

   
    $stmt = $pdo->prepare($sql);

    $stmt->execute([$id_produto]);

    $produto = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($produto) {
        echo json_encode([
            'status' => 'success',
            'produto' => $produto 
        ]);
    } else {
        http_response_code(404); 
        echo json_encode([
            'status' => 'error',
            'message' => 'Produto não encontrado.'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro interno ao buscar produto.',
        'error_details' => $e->getMessage()
    ]);
}
