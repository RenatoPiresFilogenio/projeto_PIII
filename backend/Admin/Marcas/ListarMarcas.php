<?php
require("../../DB/database.php");

header('Content-Type: application/json');

// --- Parâmetros ---
$limit = 12; 
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

// Captura a busca
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // 1. Montar WHERE dinâmico
    $whereClause = "WHERE is_delete = FALSE";
    $params = [];

    if (!empty($search)) {
        $whereClause .= " AND nome ILIKE :search";
        $params[':search'] = "%$search%";
    }

    // 2. Contar total (com filtro)
    $sqlCount = "SELECT COUNT(*) as total FROM marcas $whereClause";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($params);
    $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    // 3. Buscar dados (com filtro + paginação)
    $sqlData = "SELECT * FROM marcas 
                $whereClause
                ORDER BY nome ASC
                LIMIT :limit OFFSET :offset";
            
    $stmt = $pdo->prepare($sqlData);
    
    // Bind dos parâmetros de busca
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    // Bind da paginação
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'marcas' => $marcas,
        'paginacao' => [
            'total_registros' => $totalRegistros,
            'pagina_atual' => $page,
            'total_paginas' => ceil($totalRegistros / $limit),
            'itens_por_pagina' => $limit
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao buscar marcas.',
        'error' => $e->getMessage()
    ]);
}
?>