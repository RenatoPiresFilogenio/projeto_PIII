<?php
session_start();
require("../DB/database.php");

if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não logado']);
    exit;
}

$idUsuario = $_SESSION['id_usuario'];

// Configuração da Paginação
$limit = 6; 
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

try {
    // 1. Contar total
    $sqlCount = "SELECT COUNT(*) as total FROM imoveis WHERE fk_usuarios_id_usuario = :id_usuario AND is_delete = false";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute(['id_usuario' => $idUsuario]);
    $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. Buscar dados paginados
    $sqlData = "
        SELECT 
            i.id,
            i.identificador AS nome,
            i.logradouro AS rua,
            i.numero,
            i.cep,
            i.consumo,
            b.nm_bairro AS bairro,
            c.nm_cidade AS cidade,
            COALESCE(e.sg_estado, e.nm_estado) AS estado,
            r.nome AS regiao
        FROM imoveis i
        INNER JOIN bairros b ON i.fk_bairros_id_bairro = b.id_bairro
        INNER JOIN cidades c ON b.fk_cidades_id_cidade = c.id_cidade
        INNER JOIN estados e ON c.fk_estados_id_estado = e.id_estado
        LEFT JOIN regiao r ON e.fk_regiao_id_regiao = r.id_regiao
        WHERE i.fk_usuarios_id_usuario = :id_usuario AND i.is_delete = false
        ORDER BY i.id DESC
        LIMIT :limit OFFSET :offset
    ";
    
    $stmt = $pdo->prepare($sqlData);
    $stmt->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $imoveis = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'data' => $imoveis,
        'paginacao' => [
            'total_registros' => $totalRegistros,
            'pagina_atual' => $page,
            'total_paginas' => ceil($totalRegistros / $limit),
            'itens_por_pagina' => $limit
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>