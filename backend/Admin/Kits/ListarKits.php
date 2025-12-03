<?php
require("../../DB/database.php");
header('Content-Type: application/json');

// --- Parâmetros ---
$limit = 12; 
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$consumo = isset($_GET['consumo']) ? (float)$_GET['consumo'] : 0;

try {
    // 1. Montar WHERE dinâmico
    $whereClause = "WHERE is_delete = FALSE";
    $params = [];

    // Filtro de Texto
    if (!empty($search)) {
        $whereClause .= " AND descricao ILIKE :search";
        $params[':search'] = "%$search%";
    }

    // Filtro de Consumo (A Mágica acontece aqui)
    // Fator de conversão: 1 kWp ~= 120 kWh/mês
    if ($consumo > 0) {
        if ($consumo == 99999) {
            // Caso "+ de 1250" (maior que ~10.4 kWp)
            $whereClause .= " AND potencia_ideal > 10.4";
        } else {
            // Calcula a potência máxima permitida para esse consumo
            $maxPotencia = $consumo / 120;
            $whereClause .= " AND potencia_ideal <= :maxPotencia";
            $params[':maxPotencia'] = $maxPotencia;
        }
    }

    // 2. Conta Total
    $sqlCount = "SELECT COUNT(*) as total FROM kits $whereClause";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($params);
    $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    // 3. Busca Dados
    $sql = "SELECT * FROM kits 
            $whereClause
            ORDER BY potencia_ideal ASC -- Ordenei por potência pra ficar mais organizado
            LIMIT :limit OFFSET :offset";
            
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'produtos' => $produtos, 
        'paginacao' => [
            'total_registros' => $totalRegistros,
            'pagina_atual' => $page,
            'total_paginas' => ceil($totalRegistros / $limit),
            'itens_por_pagina' => $limit
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>