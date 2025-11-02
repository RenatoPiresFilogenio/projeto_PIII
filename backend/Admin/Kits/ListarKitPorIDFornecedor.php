<?php

require("../../DB/database.php");


if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_fornecedor/editar_fornecedor.html");
    exit; 
}

header('Content-Type: application/json');

try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $id_fornecedor = intval($_GET['id'] ?? 0);

    if (!$id_fornecedor) {
        http_response_code(400); 
        echo json_encode(['erro' => 'ID do fornecedor inválido ou não fornecido.']);
        exit; 
    }

    
    $sql_kit_produto = "SELECT fk_kit_id FROM kit_produtos WHERE fk_fornecedor_id = :id_fornecedor LIMIT 1";
    $stmt_kit_produto = $pdo->prepare($sql_kit_produto);
    $stmt_kit_produto->execute([':id_fornecedor' => $id_fornecedor]);

    $kit_produto = $stmt_kit_produto->fetch(PDO::FETCH_ASSOC);

    if (!$kit_produto) {
        http_response_code(404); 
        echo json_encode(['erro' => 'Nenhum kit encontrado para este fornecedor.']);
        exit; 
    }

    
    $id_kit = $kit_produto['fk_kit_id'];

    $sql_kit = "SELECT * FROM kits WHERE id_kit = :id_kit";
    $stmt_kit = $pdo->prepare($sql_kit);

    $stmt_kit->execute([':id_kit' => $id_kit]);

    $kit = $stmt_kit->fetch(PDO::FETCH_ASSOC);

    if ($kit) {
        echo json_encode($kit);
    } else {
        http_response_code(404);
        echo json_encode(['erro' => 'Detalhes do kit não encontrados (ID: ' . $id_kit . ').']);
    }
} catch (\Throwable $th) { 
    http_response_code(500); 
    echo json_encode(['erro' => 'Erro ao consultar o banco de dados: ' . $th->getMessage()]);
}

?>