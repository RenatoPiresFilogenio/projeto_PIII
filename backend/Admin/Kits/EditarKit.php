<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
header('Content-Type: application/json'); 

// ==========================================
// AÇÃO 1: ATUALIZAR KIT (POST)
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $id_kit = intval($_POST['kit_id'] ?? 0);
    $descricao_kit = trim($_POST['kit_descricao'] ?? null);
    $id_fornecedor = intval($_POST['fornecedor_kit_id'] ?? 0);

    $produto_ids_array = $_POST['produto_ids'] ?? [];
    $quantidades_array = $_POST['quantidades'] ?? [];
    $valores_array_br = $_POST['valores_unitarios'] ?? []; 

    if ($id_kit <= 0 || empty($descricao_kit) || $id_fornecedor <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios não preenchidos.']);
        exit;
    }
    if (empty($produto_ids_array)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'O kit deve conter pelo menos um produto.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. CALCULAR POTÊNCIA TOTAL EM WATTS BRUTOS (SIMPLES)
        $potencia_total_watts = 0.0;
        $sql_produto_info = "SELECT tipo_produto, potencia_kwh FROM produtos WHERE id_produto = :produto_id";
        $stmt_produto_info = $pdo->prepare($sql_produto_info);

        foreach ($produto_ids_array as $index => $produto_id) {
            $stmt_produto_info->execute([':produto_id' => intval($produto_id)]);
            $produto = $stmt_produto_info->fetch(PDO::FETCH_ASSOC);

            if ($produto && $produto['tipo_produto'] === '1') { // Tipo 1 = Placa Solar
                $quantidade = intval($quantidades_array[$index]);
                
                // Pega o valor bruto em Watts do banco
                $potencia_str = str_replace(',', '.', $produto['potencia_kwh']);
                $potencia_unit_watts = floatval(preg_replace("/[^0-9\.]/", "", $potencia_str));

                // Soma a potência total BRUTA (Watts)
                $potencia_total_watts += ($potencia_unit_watts * $quantidade);
            }
        }
        
        // 2. ATUALIZAR TABELA KITS (Potência BRUTA EM WATTS)
        // O campo potencia_ideal agora guarda Watts, como você preferiu.
        $sql_update_kit = "UPDATE kits SET descricao = :descricao, potencia_ideal = :potencia_watts WHERE id_kit = :id_kit";
        $stmt_update_kit = $pdo->prepare($sql_update_kit);
        $stmt_update_kit->execute([
            ':descricao' => $descricao_kit,
            ':potencia_watts' => $potencia_total_watts,
            ':id_kit' => $id_kit
        ]);

        // 3. ATUALIZAR PRODUTOS DO KIT (Apaga velhos -> Insere novos)
        $sql_delete_itens = "DELETE FROM kit_produtos WHERE fk_kit_id = :id_kit";
        $stmt_delete_itens = $pdo->prepare($sql_delete_itens);
        $stmt_delete_itens->execute([':id_kit' => $id_kit]);

        $sql_itens = "INSERT INTO kit_produtos (fk_kit_id, fk_produto_id, fk_fornecedor_id, quantidade, valor_unitario) VALUES (:kit_id, :produto_id, :fornecedor_id, :quantidade, :valor_unitario)";
        $stmt_itens = $pdo->prepare($sql_itens);

        foreach ($produto_ids_array as $index => $produto_id) {
            $quantidade = intval($quantidades_array[$index]);
            $valor_br = $valores_array_br[$index];

            // LIMPEZA CRÍTICA: Tira separador de milhar (ponto) e troca a vírgula decimal por ponto.
            $valor_limpo = str_replace('.', '', $valor_br);
            $valor_unitario = floatval(str_replace(',', '.', $valor_limpo)); 
            
            // Verifica se o valor limpo ultrapassa o limite de 8 dígitos inteiros (10^8)
            // Para garantir que o estouro não ocorra.
            if ($valor_unitario >= 100000000.00) {
                 throw new Exception("Valor unitário muito alto para o banco de dados.");
            }


            if ($quantidade <= 0) continue; 

            $stmt_itens->execute([
                ':kit_id' => $id_kit,
                ':produto_id' => intval($produto_id),
                ':fornecedor_id' => $id_fornecedor,
                ':quantidade' => $quantidade,
                ':valor_unitario' => $valor_unitario
            ]);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true, 
            'message' => 'Kit atualizado com sucesso!',
            'nova_potencia' => $potencia_total_watts 
        ]);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        exit;
    }
}
// ==========================================
// AÇÃO 2: EXCLUIR (GET)
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'delete') {
    $id_kit = intval($_GET['id'] ?? 0);

    if ($id_kit <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID inválido.']);
        exit;
    }

    try {
        // Verifica uso em orçamentos
        $check = $pdo->prepare("SELECT COUNT(*) FROM kit_orcamento WHERE fk_kit_id = :id");
        $check->execute([':id' => $id_kit]);
        
        if ($check->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'error' => 'in_use', 'message' => 'Kit em uso em orçamentos.']);
            exit;
        }

        // Soft Delete
        $stmt = $pdo->prepare("UPDATE kits SET is_delete = TRUE WHERE id_kit = :id");
        $stmt->execute([':id' => $id_kit]);

        echo json_encode(['success' => true, 'message' => 'Kit excluído.']);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método inválido.']);
exit;
?>