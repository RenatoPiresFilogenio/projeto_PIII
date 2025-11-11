<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
header('Content-Type: application/json'); 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $id_kit = intval($_POST['kit_id'] ?? 0);
    $descricao_kit = trim($_POST['kit_descricao'] ?? null);
    $id_fornecedor = intval($_POST['fornecedor_kit_id'] ?? 0);

    $produto_ids_array = $_POST['produto_ids'] ?? [];
    $quantidades_array = $_POST['quantidades'] ?? [];
    $valores_array_br = $_POST['valores_unitarios'] ?? []; 

    if ($id_kit <= 0 || empty($descricao_kit) || $id_fornecedor <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios (Kit, Descrição, Fornecedor) não preenchidos.']);
        exit;
    }
    if (empty($produto_ids_array)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'O kit deve conter pelo menos um produto.']);
        exit;
    }
    if (count($produto_ids_array) !== count($quantidades_array) || count($produto_ids_array) !== count($valores_array_br)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados dos produtos estão inconsistentes.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $sql_update_kit = "UPDATE kits SET descricao = :descricao WHERE id_kit = :id_kit";
        $stmt_update_kit = $pdo->prepare($sql_update_kit);
        $stmt_update_kit->execute([
            ':descricao' => $descricao_kit,
            ':id_kit' => $id_kit
        ]);

       
        $sql_delete_itens = "DELETE FROM kit_produtos WHERE fk_kit_id = :id_kit";
        $stmt_delete_itens = $pdo->prepare($sql_delete_itens);
        $stmt_delete_itens->execute([':id_kit' => $id_kit]);

        $sql_itens = "
            INSERT INTO kit_produtos 
                (fk_kit_id, fk_produto_id, fk_fornecedor_id, quantidade, valor_unitario)
            VALUES 
                (:kit_id, :produto_id, :fornecedor_id, :quantidade, :valor_unitario)
        ";
        $stmt_itens = $pdo->prepare($sql_itens);

        foreach ($produto_ids_array as $index => $produto_id) {
            $quantidade = intval($quantidades_array[$index]);
            $valor_br_string = $valores_array_br[$index];

            $valor_unitario = floatval(str_replace(',', '.', str_replace('.', '', $valor_br_string)));

            if ($quantidade <= 0 || $valor_unitario < 0) {
                throw new Exception("Quantidade ou valor inválido para o produto ID $produto_id.");
            }

            $stmt_itens->execute([
                ':kit_id' => $id_kit,
                ':produto_id' => intval($produto_id),
                ':fornecedor_id' => $id_fornecedor,
                ':quantidade' => $quantidade,
                ':valor_unitario' => $valor_unitario
            ]);
        }

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Kit atualizado com sucesso!']);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
        exit;
    }
}

/* ===========================================
 * AÇÃO 2: EXCLUIR (SOFT DELETE) - via GET (API)
 * =========================================== */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'delete') {
    
    $id_kit = intval($_GET['id'] ?? 0);

    if ($id_kit <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_id', 'message' => 'ID inválido.']);
        exit;
    }

    try {
        $check_sql = "SELECT COUNT(*) FROM kit_orcamento WHERE FK_KIT_ID = :id AND (is_delete = FALSE OR is_delete IS NULL)";
        $check_stmt = $pdo->prepare($check_sql);
        $check_stmt->execute([':id' => $id_kit]);
        $count = $check_stmt->fetchColumn();

        if ($count > 0) {
            http_response_code(409); 
            echo json_encode([
                'success' => false, 
                'error' => 'in_use', 
                'message' => 'Este kit está em uso por ' . $count . ' orçamento(s) ativo(s) e não pode ser excluído.'
            ]);
            exit;
        }

        $sql = "UPDATE kits SET is_delete = TRUE WHERE id_kit = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id_kit]);

        echo json_encode(['success' => true, 'message' => 'Kit excluído com sucesso.']);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'unknown', 'message' => $e->getMessage()]);
        exit;
    }
}

// Se o script for acessado sem método POST ou GET válido
http_response_code(405); // Method Not Allowed
echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
exit;
?>