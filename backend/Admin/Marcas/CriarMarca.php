<?php
require("../../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $site_oficial   = trim($_POST['site_oficial'] ?? '');
    $pais_origem    = trim($_POST['pais_origem'] ?? '');
    $nome           = trim($_POST['nome'] ?? '');
    $modelo         = trim($_POST['modelo'] ?? '');
    $lista_produtos = trim($_POST['id_produto'] ?? '');

    if (empty($site_oficial) || empty($pais_origem) || empty($nome) || empty($modelo)) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
        exit();
    }
    try {
        $pdo->beginTransaction();

        $sql = "SELECT id_marca 
                FROM marcas 
                WHERE nome = :nome 
                  AND modelo = :modelo";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome'       => $nome,
            ':modelo'     => $modelo,
        ]);
        $marca = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($marca) {
            header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
            exit();
        } else {
            $sql = "INSERT INTO marcas (nome, modelo, data_cadastro, site_oficial, pais_origem)
                    VALUES (:nome, :modelo, CURRENT_DATE, :site_oficial, :pais)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'       => $nome,
                ':modelo'     => $modelo,
                ':site_oficial' => $site_oficial,
                ':pais'       => $pais_origem
            ]);
            $id_marca = $pdo->lastInsertId();
        }

        $pdo->commit();
        header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
        exit();
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao cadastrar produto/marca: " . $e->getMessage());
        exit();
    }
} else {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    exit();
}
