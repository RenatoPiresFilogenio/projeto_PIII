<?php
require("../../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    $nome_produto   = trim($_POST['nome_produto'] ?? '');
    $modelo_produto = trim($_POST['modelo_produto'] ?? '');
    $valor_unitario = $_POST['valor_unitario'] ?? 0;
    $tipo_produto   = trim($_POST['tipo_produto'] ?? '');
    $id_marca       = $_POST['id_marca'] ?? '';

    if (!$nome_produto || !$modelo_produto || !$tipo_produto || !$id_marca || !$valor_unitario) {
        http_response_code(400);
        json_encode([
            'status' => 'error',
            'message' => 'Campos obrigatórios não preenchidos.'
        ]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Verifica se o produto já existe (mesmo modelo e marca)
        $sqlCheck = "SELECT id_produto 
                     FROM produtos 
                     WHERE modelo = :modelo AND fk_marcas_id_marca = :marca";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute([
            ':modelo' => $modelo_produto,
            ':marca'  => $id_marca
        ]);
        $produtoExistente = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($produtoExistente) {
            $pdo->rollBack();
            http_response_code(409); // Conflito
            json_encode([
                'status' => 'error',
                'message' => 'Produto já cadastrado para esta marca.',
                'id_produto_existente' => $produtoExistente['id_produto']
            ]);
            exit();
        }

        // Inserção do produto
        $sql = "INSERT INTO produtos (nome, modelo, valor_unitario, tipo_produto, fk_marcas_id_marca)
                VALUES (:nome, :modelo, :valor, :tipo, :marca)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome'   => $nome_produto,
            ':modelo' => $modelo_produto,
            ':valor'  => $valor_unitario,
            ':tipo'   => $tipo_produto,
            ':marca'  => $id_marca
        ]);

        $id_produto = $pdo->lastInsertId();
        $pdo->commit();

       json_encode([
            'status' => 'success',
            'message' => 'Produto cadastrado com sucesso!',
            'produto' => [
                'id_produto' => $id_produto,
                'nome_produto' => $nome_produto,
                'modelo_produto' => $modelo_produto,
                'valor_unitario' => $valor_unitario,
                'tipo_produto' => $tipo_produto,
                'id_marca' => $id_marca
            ]
        ]);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao cadastrar produto: " . $e->getMessage());

        http_response_code(500);
       json_encode([
            'status' => 'error',
            'message' => 'Erro no banco de dados: ' . $e->getMessage()
        ]);
        exit();
    }
} else {
    http_response_code(405);
   json_encode([
        'status' => 'error',
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit();
}
