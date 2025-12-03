<?php
require("../../DB/database.php");

header('Content-Type: application/json');

// --- Parâmetros ---
$limit = 12; 
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

// Captura filtros
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : '';

// --- GATILHO PARA SELECTS ---
// Se vier ?all=true na URL, desativa a paginação
$showAll = isset($_GET['all']) && $_GET['all'] === 'true';

try {
    $whereClause = "WHERE p.is_delete = FALSE";
    $params = [];

    if (!empty($search)) {
        $whereClause .= " AND (p.nome ILIKE :search OR p.modelo ILIKE :search)";
        $params[':search'] = "%$search%";
    }

    if (!empty($tipo)) {
        $whereClause .= " AND p.tipo_produto = :tipo";
        $params[':tipo'] = $tipo;
    }

    // Contagem (Só faz sentido se for paginado)
    $totalRegistros = 0;
    if (!$showAll) {
        $sqlCount = "SELECT COUNT(*) as total FROM produtos p $whereClause";
        $stmtCount = $pdo->prepare($sqlCount);
        $stmtCount->execute($params);
        $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];
    }

    // Busca Dados
    $sqlData = "SELECT p.*, m.nome AS nome_marca, m.modelo AS modelo_marca 
                FROM produtos p
                JOIN marcas m ON p.fk_marcas_id_marca = m.id_marca
                $whereClause
                ORDER BY p.id_produto DESC";
    
    // Só aplica o LIMIT se NÃO for para mostrar tudo
    if (!$showAll) {
        $sqlData .= " LIMIT :limit OFFSET :offset";
    }
            
    $stmt = $pdo->prepare($sqlData);
    
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    
    if (!$showAll) {
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Resposta
    $response = [
        'status' => 'success',
        'produtos' => $produtos
    ];

    if (!$showAll) {
        $response['paginacao'] = [
            'total_registros' => $totalRegistros,
            'pagina_atual' => $page,
            'total_paginas' => ceil($totalRegistros / $limit),
            'itens_por_pagina' => $limit
        ];
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao buscar produtos.',
        'error' => $e->getMessage()
    ]);
}
?>