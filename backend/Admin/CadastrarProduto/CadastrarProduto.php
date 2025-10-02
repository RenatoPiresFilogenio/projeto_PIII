<?php
require("../../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome_produto   = trim($_POST['nome_produto'] ?? '');
    $modelo_produto = trim($_POST['modelo_produto'] ?? '');
    $valor_unitario = $_POST['valor_unitario'] ?? 0;
    $tipo_produto   = trim($_POST['tipo_produto'] ?? '');

    $nome_marca     = trim($_POST['nome_marca'] ?? '');
    $modelo_marca   = trim($_POST['modelo_marca'] ?? '');
    $pais_origem    = trim($_POST['pais_origem'] ?? '');
    $site_oficial   = trim($_POST['site_oficial'] ?? ''); // corrigido
    $id_fornecedor  = $_POST['id_fornecedor'] ?? 0;

    if (!$nome_produto || !$tipo_produto || !$nome_marca || !$id_fornecedor || !$pais_origem || !$site_oficial) {
        header("Location: ../../../frontend/dashboards/Admin/cadastro_produtos/cadastroProdutos.html?status=bad_request");
        exit(); 
    }

    try {
        $pdo->beginTransaction();

        $sql = "SELECT id_marca 
                FROM marcas 
                WHERE nome = :nome 
                AND modelo = :modelo 
                AND fk_fornecedores_id = :fornecedor";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome'       => $nome_marca,
            ':modelo'     => $modelo_marca,
            ':fornecedor' => $id_fornecedor
        ]);
        $marca = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($marca) {
            $id_marca = $marca['id_marca'];
        } else {
            $sql = "INSERT INTO marcas (nome, modelo, fk_fornecedores_id, data_cadastro, site_oficial, pais_origem)
                    VALUES (:nome, :modelo, :fornecedor, CURRENT_DATE, :site, :pais) RETURNING id_marca";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'       => $nome_marca,
                ':modelo'     => $modelo_marca,
                ':fornecedor' => $id_fornecedor,
                ':site'       => $site_oficial,
                ':pais'       => $pais_origem
            ]);
            $id_marca = $stmt->fetchColumn();
        }

        $sql = "INSERT INTO produtos (nome, modelo, valor_unitario, tipo_produto, fk_marcas_id)
                VALUES (:nome, :modelo, :valor, :tipo, :marca)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome'   => $nome_produto,
            ':modelo' => $modelo_produto,
            ':valor'  => $valor_unitario,
            ':tipo'   => $tipo_produto,
            ':marca'  => $id_marca
        ]);

        $pdo->commit();
        header("Location: ../../../frontend/dashboards/Admin/cadastro_produtos/cadastroProdutos.html?status=sucesso");
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao cadastrar produto/marca: " . $e->getMessage());
        header("Location: ../../../frontend/dashboards/Admin/cadastro_produtos/cadastroProdutos.html?status=erro");
        exit();
    }
}
