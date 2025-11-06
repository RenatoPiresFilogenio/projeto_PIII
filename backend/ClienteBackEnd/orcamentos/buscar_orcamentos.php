<?php

require_once '../../DB/database.php';

session_start();

header('Content-Type: application/json');


if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não autenticado.']);
    exit();
}

if (!isset($_GET['id_imovel'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID do imóvel não fornecido.']);
    exit();
}

try {

    $id_imovel = $_GET['id_imovel'];
    $id_usuario = $_SESSION['id_usuario'];

    $sql_imovel = "SELECT consumo FROM IMOVEIS WHERE ID = ? AND FK_USUARIOS_ID_USUARIO = ?";

    $stmt_imovel = $pdo->prepare($sql_imovel);

    $stmt_imovel->execute([$id_imovel, $id_usuario]);

    $imovel = $stmt_imovel->fetch(PDO::FETCH_ASSOC);
    if ($imovel === false) {

        http_response_code(403); 

        echo json_encode(['erro' => 'Imóvel não encontrado ou não pertence a você.']);

        exit();
    }
    $consumo_cliente = (float) $imovel['consumo'];    
    $sql_kits = "

        SELECT 

            k.id_kit AS id_kit,

            k.descricao AS kit_descricao,

            k.potencia_ideal AS systemPower,

            SUM(kp.quantidade * kp.valor_unitario) AS totalPrice,

            f.nome AS name,

            f.id_fornecedor AS supplierId,

            STRING_AGG(CONCAT(kp.quantidade, 'x ', p.nome), ', ') AS products

    
        FROM 

            kits k

        JOIN 

            kit_produtos kp ON k.id_kit = kp.fk_kit_id

        JOIN 

            produtos p ON kp.fk_produto_id = p.id_produto

        JOIN 

            fornecedores f ON kp.fk_fornecedor_id = f.id_fornecedor

        WHERE 

            k.potencia_ideal >= ?

            AND k.is_delete = FALSE

            AND kp.is_delete = FALSE

       GROUP BY
            k.id_kit, k.descricao, k.potencia_ideal, f.nome, f.id_fornecedor
        ORDER BY
            CAST(SUM(kp.quantidade * kp.valor_unitario) AS DECIMAL) ASC  -- <-- CORREÇÃO
        LIMIT 3
    ";
    $stmt_kits = $pdo->prepare($sql_kits);

    $stmt_kits->execute([$consumo_cliente]);

   $kits_compativeis = $stmt_kits->fetchAll(PDO::FETCH_ASSOC);

    
    $budgets_formatados = [];
  
    
    foreach ($kits_compativeis as $kit_do_banco) {
    
        $total_price_num = (float) $kit_do_banco['totalprice'];
        $system_power_num = (float) $kit_do_banco['systempower'];

        $budget_formatado = [];
        
        $budget_formatado['id'] = $kit_do_banco['id_kit'];
        $budget_formatado['name'] = $kit_do_banco['name'];
        $budget_formatado['products'] = $kit_do_banco['products'];
        $budget_formatado['supplierId'] = $kit_do_banco['supplierid'];
        
        $budget_formatado['totalPrice'] = $total_price_num;
        $budget_formatado['systemPower'] = $system_power_num;
        
        $budget_formatado['rating'] = rand(45, 49) / 10;
        $budget_formatado['isPremium'] = ($budget_formatado['rating'] > 4.7);
        $budget_formatado['monthlyInstallment'] = round(($total_price_num * 1.8) / 60, 2); 
        

        $tarifa_media_kwh = 0.85; 
        $eficiencia_sistema = 0.95; // 95%
        $budget_formatado['estimatedSavings'] = round($consumo_cliente * $tarifa_media_kwh * $eficiencia_sistema, 2); 
        
        $budgets_formatados[] = $budget_formatado;
    }

    echo json_encode($budgets_formatados);
} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode(['erro' => 'Erro ao buscar propostas: ' . $e->getMessage()]);
}
