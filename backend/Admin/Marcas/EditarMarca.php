<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
header('Content-Type: application/json'); // Sempre responderá com JSON

$redirect_url_list = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id_marca = intval($_POST['id_marca'] ?? 0);

    if ($id_marca <= 0) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'ID de marca inválido.']);
        exit;
    }

    try {
        $nome_novo = trim($_POST['nome_marca']);
        $modelo_novo = trim($_POST['Modelo']);
        $site_novo = trim($_POST['site_oficial']);
        $pais_novo = trim($_POST['pais_origem']);

        $sql = "UPDATE marcas SET 
                    nome = ?, 
                    modelo = ?, 
                    site_oficial = ?, 
                    pais_origem = ?
                WHERE id_marca = ?";

        $stmt_update = $pdo->prepare($sql);
        $stmt_update->execute([
            $nome_novo,
            $modelo_novo,
            $site_novo,
            $pais_novo,
            $id_marca
        ]);

  
        echo json_encode([
            'success' => true,
            'message' => 'Marca atualizada com sucesso!',
            'marca' => [
                'id_marca' => $id_marca,
                'nome' => $nome_novo,
                'modelo' => $modelo_novo,
                'site_oficial' => $site_novo,
                'pais_origem' => $pais_novo
            ]
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'delete') {

    header('Content-Type: application/json');

    $id_marca = intval($_GET['id'] ?? 0);

    if ($id_marca <= 0) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'error' => 'invalid_id', 'message' => 'ID inválido.']);
        exit;
    }

    try {
       
        $check_sql = "SELECT COUNT(*) 
                      FROM produtos 
                      WHERE FK_MARCAS_ID_MARCA = :id 
                      AND (is_delete = FALSE OR is_delete IS NULL)";

        $check_stmt = $pdo->prepare($check_sql);
        $check_stmt->execute([':id' => $id_marca]);
        $count_produtos = $check_stmt->fetchColumn();

        if ($count_produtos > 0) {
            http_response_code(409); 
            echo json_encode([
                'success' => false,
                'error' => 'in_use',
                'message' => 'Esta marca está em uso por ' . $count_produtos . ' produto(s) ativo(s) e não pode ser excluída.'
            ]);
            exit;
        }

      
        $sql = "UPDATE marcas SET is_delete = TRUE WHERE id_marca = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id_marca]);

        // Sucesso
        echo json_encode(['success' => true, 'message' => 'Marca excluída com sucesso.']);
        exit;
    } catch (PDOException $e) {
        // Erro genérico
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'error' => 'unknown', 'message' => $e->getMessage()]);
        exit;
    }
}
