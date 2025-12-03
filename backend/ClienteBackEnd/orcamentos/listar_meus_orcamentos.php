<?php
require_once '../../DB/database.php';
session_start();

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401); 
    echo json_encode(['erro' => 'Usuário não autenticado.']);
    exit(); 
}

header('Content-Type: application/json');

try {
    $id_cliente_logado = $_SESSION['id_usuario'];

    // Query simplificada e direta
    // Removemos o JOIN com USUARIOS (desnecessário, já temos o ID)
    // Mantivemos a busca de produtos, mas protegida com COALESCE para não vir nulo
    $sql = "
        SELECT 
            o.id_orcamento,
            o.data,
            o.valor_total,
            o.status,
            f.nome AS fornecedor_nome,
            i.identificador AS imovel_nome,
            i.consumo AS imovel_consumo,
            
            -- Traz dados do kit se houver
            ko.potencia_ideal,
            
            -- Subquery para produtos (agrupada para não duplicar linhas)
            (
                SELECT STRING_AGG(CONCAT(kp.quantidade, 'x ', p.nome), ', ')
                FROM kit_orcamento ko2
                JOIN kits k ON ko2.fk_kit_id = k.id_kit
                JOIN kit_produtos kp ON kp.fk_kit_id = k.id_kit
                JOIN produtos p ON kp.fk_produto_id = p.id_produto
                WHERE ko2.fk_orcamento_id = o.id_orcamento
            ) as produtos_inclusos

        FROM orcamento o
        JOIN imoveis i ON o.fk_imoveis_id = i.id
        LEFT JOIN fornecedores f ON o.fk_fornecedor_id = f.id_fornecedor
        LEFT JOIN kit_orcamento ko ON ko.fk_orcamento_id = o.id_orcamento
        
        WHERE o.is_delete = false 
        AND i.fk_usuarios_id_usuario = :id_usuario
        
        ORDER BY o.data DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id_usuario' => $id_cliente_logado]); 
    $all_budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = ['history' => []];

    foreach ($all_budgets as $budget) {
        $formatted = [
            'id_orcamento' => $budget['id_orcamento'],
            'data' => $budget['data'],
            'valor_total' => $budget['valor_total'],
            'fornecedor_nome' => $budget['fornecedor_nome'] ?? 'Fornecedor não informado',
            'potencia_ideal' => $budget['potencia_ideal'] ?? 0,
            'produtos' => $budget['produtos_inclusos'] ?? 'Kit Padrão',
            'imovel_nome' => $budget['imovel_nome'],
            'imovel_consumo' => $budget['imovel_consumo']
        ];

        $status = strtolower($budget['status']);

        // Classificação Simples: Aprovado ou Recusado
        // Adicionei 'aguarda_adm' como aprovado para garantir que apareça
        if ($status === 'aprovado' || $status === 'confirmado' || $status === 'aguarda_adm') {
            $formatted['status_class'] = 'approved';
            $formatted['status_texto'] = 'Aprovado';
        } 
        else if ($status === 'recusado' || $status === 'rejeitado') {
            $formatted['status_class'] = 'denied';
            $formatted['status_texto'] = 'Recusado';
        } 
        else {
            $formatted['status_class'] = 'other';
            $formatted['status_texto'] = ucfirst($status);
        }

        $response['history'][] = $formatted;
    }

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro SQL: ' . $e->getMessage()]);
}
?>