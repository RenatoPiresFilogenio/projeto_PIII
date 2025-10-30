<?php
require("../../DB/database.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $site_oficial   = trim($_POST['site_oficial'] ?? '');
    $pais_origem    = trim($_POST['pais_origem'] ?? '');
    $nome           = trim($_POST['nome'] ?? '');
    $modelo         = trim($_POST['modelo'] ?? '');
    $lista_produtos = trim($_POST['id_produto'] ?? '');
    
    if (empty($site_oficial) || empty($pais_origem) || empty($nome) || empty($modelo)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Campos obrigatórios não preenchidos.'
        ]);
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
            $id_marca = $marca['id_marca'];
             echo json_encode([
            'status' => 'erro',
            'message' => 'Produto/marca já cadastrado na plataforma!',
            'id_marca' => $id_marca
        ]);
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

       json_encode([
            'status' => 'success',
            'message' => 'Produto/marca cadastrado com sucesso!',
            'id_marca' => $id_marca
        ]);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao cadastrar produto/marca: " . $e->getMessage());

        http_response_code(500);
        json_encode([
            'status' => 'error',
            'message' => 'Erro no banco de dados.'
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
