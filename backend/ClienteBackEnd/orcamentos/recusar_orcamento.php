<?php
require_once '../../DB/database.php';
session_start();

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401); 
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit(); 
}

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$id_orcamento = $data['id_orcamento'] ?? 0;
$observacoes = trim($data['observacoes'] ?? 'Recusado pelo cliente.');
$id_cliente_logado = $_SESSION['id_usuario'];

if ($id_orcamento <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID do orçamento inválido.']);
    exit;
}

if (empty($observacoes)) {
    $observacoes = 'Recusado pelo cliente.';
}

try {
    
    $sql_check_owner = "
        SELECT O.ID_ORCAMENTO 
        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        WHERE O.ID_ORCAMENTO = ? AND I.FK_USUARIOS_ID_USUARIO = ?
    ";
    $stmt_check = $pdo->prepare($sql_check_owner);
    $stmt_check->execute([$id_orcamento, $id_cliente_logado]);
    $orcamento_valido = $stmt_check->fetch();

    if (!$orcamento_valido) {
        http_response_code(403); // Forbidden
        echo json_encode(['success' => false, 'message' => 'Você não tem permissão para alterar este orçamento.']);
        exit;
    }

    $sql_update = "UPDATE ORCAMENTO 
                   SET STATUS = 'recusado', OBSERVACOES = ? 
                   WHERE ID_ORCAMENTO = ? 
                   AND STATUS = 'AGUARDA_ADM'"; 
                   
    $stmt_update = $pdo->prepare($sql_update);
    $stmt_update->execute([$observacoes, $id_orcamento]);

    if ($stmt_update->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Orçamento recusado.']);
    } else {
        throw new Exception('O orçamento não pôde ser recusado (pode já ter sido processado).');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Falha no banco de dados: ' . $e->getMessage()]);
}
?>