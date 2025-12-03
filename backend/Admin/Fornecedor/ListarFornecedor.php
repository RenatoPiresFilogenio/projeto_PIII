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
        // Busca por nome ou email
        $whereClause .= " AND (nome ILIKE :search OR email ILIKE :search)";
        $params[':search'] = "%$search%";
    }

    // 2. Conta Total
    $sqlCount = "SELECT COUNT(*) as total FROM fornecedores $whereClause";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($params);
    $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    // 3. Busca Dados
    $sql = "SELECT * FROM fornecedores 
            $whereClause
            ORDER BY id_fornecedor DESC
            LIMIT :limit OFFSET :offset";
            
    $stmt = $pdo->prepare($sql);
    
    // Bind dos parâmetros de busca
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    // Bind da paginação
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $fornecedores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'fornecedores' => $fornecedores,
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