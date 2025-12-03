<?php

require_once '../../DB/database.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401); 
    echo json_encode(['erro' => 'Usuário não autenticado.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id_kit_aprovado']) || !isset($input['id_imovel']) || !isset($input['valor_total_aprovado'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados incompletos para aprovação.']);
    exit();
}

$id_kit = $input['id_kit_aprovado'];
$id_imovel = $input['id_imovel'];
$id_usuario = $_SESSION['id_usuario'];
$valor_total = $input['valor_total_aprovado'];
$potencia_ideal = $input['potencia_aprovada'];
$id_fornecedor = $input['id_fornecedor'];

$pdo->beginTransaction();

try {
   
    $sql_check = "SELECT 1 FROM IMOVEIS WHERE ID = ? AND FK_USUARIOS_ID_USUARIO = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_imovel, $id_usuario]);
    
    if ($stmt_check->fetchColumn() === false) {
         http_response_code(403); 
         throw new Exception('Acesso ao imóvel negado.');
    }
    
    // --- ALTERAÇÃO AQUI: Status inicial agora é 'aprovado' ---
    $sql_orcamento = "
        INSERT INTO ORCAMENTO 
            (DATA, VALOR_TOTAL, FK_IMOVEIS_ID, STATUS, IS_DELETE, FK_FORNECEDOR_ID) 
        VALUES 
            (NOW(), ?, ?, 'aprovado', FALSE, ?) 
        RETURNING ID_ORCAMENTO"; 
        
    $stmt_orcamento = $pdo->prepare($sql_orcamento);
    $stmt_orcamento->execute([$valor_total, $id_imovel, $id_fornecedor]);
    
    $id_orcamento_criado = $stmt_orcamento->fetchColumn();
   
    $sql_kit_orcamento = "
        INSERT INTO KIT_ORCAMENTO
            (FK_KIT_ID, FK_ORCAMENTO_ID, QUANTIDADE, VALOR_TOTAL, POTENCIA_IDEAL)
        VALUES
            (?, ?, 1, ?, ?)"; 
            
    $stmt_kit_orc = $pdo->prepare($sql_kit_orcamento);
    $stmt_kit_orc->execute([$id_kit, $id_orcamento_criado, $valor_total, $potencia_ideal]);

    $pdo->commit();

    echo json_encode([
        'sucesso' => true, 
        'id_orcamento_criado' => $id_orcamento_criado,
        'mensagem' => 'Proposta aprovada com sucesso!'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    if (http_response_code() == 200) {
        http_response_code(500); 
    }
    echo json_encode(['erro' => 'Erro ao criar orçamento: ' . $e->getMessage()]);
}
?>