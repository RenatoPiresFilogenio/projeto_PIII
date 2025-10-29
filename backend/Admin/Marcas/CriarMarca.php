<?php
require("../../DB/database.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $site_oficial   = trim($data['site_oficial'] ?? '');
    $pais_origem    = trim($data['pais_origem'] ?? '');
    $nome           = trim($data['nome'] ?? '');
    $modelo         = trim($data['modelo'] ?? '');
    $id_fornecedor  = trim($data['id_fornecedor'] ?? '');

    if (empty($site_oficial) || empty($pais_origem) || empty($nome) || empty($modelo) || empty($id_fornecedor)) {
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
                  AND modelo = :modelo 
                  AND fk_fornecedores_id = :fornecedor";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome'       => $nome,
            ':modelo'     => $modelo,
            ':fornecedor' => $id_fornecedor
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
            $sql = "INSERT INTO marcas (nome, modelo, fk_fornecedores_id, data_cadastro, site_oficial, pais_origem)
                    VALUES (:nome, :modelo, :fornecedor, CURRENT_DATE, :site, :pais)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'       => $nome,
                ':modelo'     => $modelo,
                ':fornecedor' => $id_fornecedor,
                ':site'       => $site_oficial,
                ':pais'       => $pais_origem
            ]);
            $id_marca = $pdo->lastInsertId();
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Produto/marca cadastrado com sucesso!',
            'id_marca' => $id_marca
        ]);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao cadastrar produto/marca: " . $e->getMessage());

        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro no banco de dados.'
        ]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit();
}
