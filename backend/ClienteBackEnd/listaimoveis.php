<?php
session_start();
require("../DB/database.php");

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não logado']);
    exit;
}

$idUsuario = $_SESSION['id_usuario'];

try {
$stmt = $pdo->prepare("
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
        WHERE i.fk_usuarios_id_usuario = :id_usuario
        ORDER BY i.id DESC
    ");
    
    $stmt->execute(['id_usuario' => $idUsuario]);
    $imoveis = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($imoveis);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

?>