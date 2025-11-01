<?php

require("../../DB/database.php");
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome_produto   = trim($_POST['nome_produto'] ?? '');
    $modelo_produto = trim($_POST['modelo_produto'] ?? '');
    $valor_unitario = $_POST['valor_unitario'] ?? 0;
    $tipo_produto   = trim($_POST['tipo_produto'] ?? '');
    $id_marca       = $_POST['id_marca'] ?? '';

    if (!$nome_produto || !$modelo_produto || !$tipo_produto || !$id_marca || !$valor_unitario) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
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
            header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
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

        header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
        exit();
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao cadastrar produto: " . $e->getMessage());

        header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
        exit();
    }
} else {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    exit();
}

ob_end_flush();
