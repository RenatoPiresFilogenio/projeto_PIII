<?php
require("../../DB/database.php");

header('Content-Type: application/json');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 1. Pega o ID do kit da URL (ex: ?id=2)
$id_kit = intval($_GET['id'] ?? 0);

if ($id_kit <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'ID do kit inválido.']);
    exit;
}

try {
    // 2. Busca os detalhes principais do Kit (da tabela 'kits')
    $sql_kit = "SELECT * FROM kits 
                WHERE id_kit = :id_kit 
                AND (is_delete = FALSE OR is_delete IS NULL)";
                
    $stmt_kit = $pdo->prepare($sql_kit);
    $stmt_kit->execute([':id_kit' => $id_kit]);
    $kit = $stmt_kit->fetch(PDO::FETCH_ASSOC);

    if (!$kit) {
        http_response_code(404); // Not Found
        echo json_encode(['status' => 'error', 'message' => 'Kit não encontrado ou foi excluído.']);
        exit;
    }

    // 3. Busca os produtos que já estão nesse kit
    // (Junta com a tabela 'produtos' para pegar os nomes)
    $sql_produtos = "SELECT 
                        kp.fk_produto_id,
                        kp.quantidade,
                        kp.valor_unitario,
                        kp.fk_fornecedor_id,
                        p.nome AS nome_produto,
                        p.modelo AS modelo_produto
                     FROM kit_produtos kp
                     JOIN produtos p ON kp.fk_produto_id = p.id_produto
                     WHERE kp.fk_kit_id = :id_kit";
                     
    $stmt_produtos = $pdo->prepare($sql_produtos);
    $stmt_produtos->execute([':id_kit' => $id_kit]);
    $produtos_do_kit = $stmt_produtos->fetchAll(PDO::FETCH_ASSOC);

    // 4. Adiciona o array de produtos ao objeto do kit
    $kit['produtos'] = $produtos_do_kit;

    // 5. Retorna a estrutura JSON completa que o JavaScript espera
    echo json_encode([
        'status' => 'success',
        'kit' => $kit
    ]);

} catch (Exception $e) {
    http_response_code(500); // Erro de Servidor
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro no servidor: ' . $e->getMessage()
    ]);
}
?>