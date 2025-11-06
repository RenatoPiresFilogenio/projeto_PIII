<?php
require_once '../../DB/database.php';
session_start();


if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401); 
    echo json_encode(['erro' => 'Usuário não autenticado. Faça login.']);
    exit(); 
}

header('Content-Type: application/json');

try {
    $id_cliente_logado = $_SESSION['id_usuario'];

    $sql = "
        SELECT 
            O.ID_ORCAMENTO,
            O.DATA,
            O.VALOR_TOTAL,
            O.STATUS,
            
            F.NOME AS FORNECEDOR_NOME,
            
            KO.POTENCIA_IDEAL,
            KO.PRODUTOS_INCLUSOS,
            
            I.IDENTIFICADOR AS IMOVEL_NOME,
            I.CONSUMO AS IMOVEL_CONSUMO
            
        FROM 
            ORCAMENTO O
        
        -- Join para pegar os dados do cliente (Usuário)
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        
        -- Joins da sua View (para pegar produtos e fornecedor)
        LEFT JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR
        LEFT JOIN (
            SELECT 
                ko_inner.FK_ORCAMENTO_ID, 
                ko_inner.POTENCIA_IDEAL,
                STRING_AGG(CONCAT(kp.QUANTIDADE, 'x ', p.NOME, ' ', p.MODELO), ', ') AS PRODUTOS_INCLUSOS
            FROM KIT_ORCAMENTO ko_inner
            JOIN KITS k ON k.ID_KIT = ko_inner.FK_KIT_ID
            JOIN KIT_PRODUTOS kp ON kp.FK_KIT_ID = k.ID_KIT
            JOIN PRODUTOS p ON p.ID_PRODUTO = kp.FK_PRODUTO_ID
            GROUP BY ko_inner.FK_ORCAMENTO_ID, ko_inner.POTENCIA_IDEAL
        ) KO ON KO.FK_ORCAMENTO_ID = O.ID_ORCAMENTO
        
        WHERE 
            O.IS_DELETE = FALSE
            AND U.ID_USUARIO = ?  -- A MÁGICA: Filtra APENAS os do cliente logado
        ORDER BY
            -- Coloca os pendentes primeiro, depois os mais recentes
            CASE 
                WHEN O.STATUS = 'AGUARDA_ADM' THEN 1
                WHEN O.STATUS = 'APROVADO' THEN 2
                WHEN O.STATUS = 'NEGADO' THEN 3
                ELSE 4
            END ASC,
            O.DATA DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_cliente_logado]); 
    $all_budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        'pending' => [],
        'history' => []
    ];

    foreach ($all_budgets as $budget) {
        $formatted = [
            'id_orcamento' => $budget['id_orcamento'],
            'data' => $budget['data'],
            'valor_total' => $budget['valor_total'],
            'fornecedor_nome' => $budget['fornecedor_nome'],
            'potencia_ideal' => $budget['potencia_ideal'],
            'produtos' => $budget['produtos_inclusos'],
            'imovel_nome' => $budget['imovel_nome'],
            'imovel_consumo' => $budget['imovel_consumo']
        ];

        if ($budget['status'] === 'AGUARDA_ADM') {
            $formatted['status_class'] = 'pending';
            $formatted['status_texto'] = 'Aguardando Validação'; 
            $response['pending'][] = $formatted;
        } 
        else { 
            if ($budget['status'] === 'APROVADO') {
                $formatted['status_class'] = 'approved';
                $formatted['status_texto'] = 'Aprovado pelo Admin';
            } else if ($budget['status'] === 'NEGADO') {
                $formatted['status_class'] = 'denied';
                $formatted['status_texto'] = 'Negado pelo Admin';
            } else {
                $formatted['status_class'] = 'other';
                $formatted['status_texto'] = $budget['status']; 
            }
            $response['history'][] = $formatted;
        }
    }

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha no banco de dados: ' . $e->getMessage()]);
}
?>