<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
header('Content-Type: application/json'); 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $id_fornecedor = intval($_POST['id_fornecedor'] ?? 0);
    $nome = trim($_POST['nome_fornecedor'] ?? '');
    $telefone = trim($_POST['telefone'] ?? '');
    $email = trim($_POST['email'] ?? '');

    if ($id_fornecedor <= 0 || empty($nome) || empty($telefone) || empty($email)) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'Erro: Todos os campos * são obrigatórios.']);
        exit;
    }

    try {
        $sql_fornecedor = "UPDATE fornecedores SET 
                                nome = :nome, 
                                email = :email, 
                                telefone = :telefone 
                            WHERE id_fornecedor = :id_fornecedor";

        $stmt_fornecedor = $pdo->prepare($sql_fornecedor);
        $stmt_fornecedor->execute([
            ':nome' => $nome,
            ':email' => $email,
            ':telefone' => $telefone,
            ':id_fornecedor' => $id_fornecedor
        ]);

       
        echo json_encode([
            'success' => true, 
            'message' => 'Fornecedor atualizado com sucesso!',
            'fornecedor' => [
                'id_fornecedor' => $id_fornecedor,
                'nome' => $nome,
                'email' => $email,
                'telefone' => $telefone
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
    
    $id_fornecedor = intval($_GET['id'] ?? 0);

    if ($id_fornecedor <= 0) {
        http_response_code(400); 
        echo json_encode(['success' => false, 'error' => 'invalid_id', 'message' => 'ID inválido.']);
        exit;
    }

    try {
       
        $check_marcas_sql = "SELECT COUNT(*) FROM marcas WHERE FK_FORNECEDORES_ID_FORNECEDOR = :id AND is_delete = FALSE";
        $check_marcas_stmt = $pdo->prepare($check_marcas_sql);
        $check_marcas_stmt->execute([':id' => $id_fornecedor]);
        $count_marcas = $check_marcas_stmt->fetchColumn();

        $check_kits_sql = "SELECT COUNT(*) FROM kit_produtos WHERE FK_FORNECEDOR_ID = :id AND is_delete = FALSE";
        $check_kits_stmt = $pdo->prepare($check_kits_sql);
        $check_kits_stmt->execute([':id' => $id_fornecedor]);
        $count_kits = $check_kits_stmt->fetchColumn();

        if ($count_marcas > 0 || $count_kits > 0) {
            http_response_code(409); // Conflict
            $message = "Este fornecedor não pode ser excluído pois está associado a:";
            if ($count_marcas > 0) $message .= " {$count_marcas} marca(s) ativa(s)";
            if ($count_kits > 0) $message .= " {$count_kits} produto(s) em kit(s) ativo(s)";
            
            echo json_encode([
                'success' => false, 
                'error' => 'in_use', 
                'message' => $message
            ]);
            exit;
        }

        $sql = "UPDATE fornecedores SET is_delete = TRUE WHERE id_fornecedor = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id_fornecedor]);

        echo json_encode(['success' => true, 'message' => 'Fornecedor excluído com sucesso.']);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'unknown', 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405); 
echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
exit;
?>