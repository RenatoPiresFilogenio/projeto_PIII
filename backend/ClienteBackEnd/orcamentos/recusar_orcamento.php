<?php
require_once '../../DB/database.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401); 
    echo json_encode(['sucesso' => false, 'erro' => 'Usuário não autenticado.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

// Validação dos dados que vêm do JS (agora precisamos dos dados do kit para criar o registro)
if (!isset($input['id_kit_recusado']) || !isset($input['id_imovel']) || !isset($input['valor_total'])) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => 'Dados incompletos para recusa.']);
    exit();
}

$id_kit = $input['id_kit_recusado'];
$id_imovel = $input['id_imovel'];
$id_usuario = $_SESSION['id_usuario'];
$valor_total = $input['valor_total'];
$id_fornecedor = $input['id_fornecedor'];
$observacoes = "Recusado pelo cliente na tela de seleção.";

$pdo->beginTransaction();

try {
    // 1. Verifica se o imóvel pertence ao usuário
    $sql_check = "SELECT 1 FROM IMOVEIS WHERE ID = ? AND FK_USUARIOS_ID_USUARIO = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_imovel, $id_usuario]);
    
    if ($stmt_check->fetchColumn() === false) {
         http_response_code(403); 
         throw new Exception('Acesso ao imóvel negado.');
    }
    
    // 2. CRIA O ORÇAMENTO JÁ COMO 'RECUSADO'
    $sql_orcamento = "
        INSERT INTO ORCAMENTO 
            (DATA, VALOR_TOTAL, FK_IMOVEIS_ID, STATUS, IS_DELETE, FK_FORNECEDOR_ID, OBSERVACOES_ADMIN) 
        VALUES 
            (NOW(), ?, ?, 'recusado', FALSE, ?, ?) 
        RETURNING ID_ORCAMENTO"; 
        
    $stmt_orcamento = $pdo->prepare($sql_orcamento);
    $stmt_orcamento->execute([$valor_total, $id_imovel, $id_fornecedor, $observacoes]);
    
    $id_orcamento_criado = $stmt_orcamento->fetchColumn();
   
    // 3. Vincula o Kit ao orçamento recusado (para histórico)
    $sql_kit_orcamento = "
        INSERT INTO KIT_ORCAMENTO
            (FK_KIT_ID, FK_ORCAMENTO_ID, QUANTIDADE, VALOR_TOTAL, POTENCIA_IDEAL)
        VALUES
            (?, ?, 1, ?, 0)"; // Potência 0 ou envie do JS se quiser
            
    $stmt_kit_orc = $pdo->prepare($sql_kit_orcamento);
    $stmt_kit_orc->execute([$id_kit, $id_orcamento_criado, $valor_total]);

    $pdo->commit();

    echo json_encode([
        'sucesso' => true, 
        'mensagem' => 'Orçamento recusado e registrado com sucesso.'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500); 
    echo json_encode(['sucesso' => false, 'erro' => 'Erro ao recusar: ' . $e->getMessage()]);
}
?>