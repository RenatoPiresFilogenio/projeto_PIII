<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    exit;
}

/*
 * ===========================================
 * 1. RECEBIMENTO E VALIDAÇÃO DOS DADOS
 * ===========================================
 */

$nome_kit = trim($_POST['kit_nome'] ?? null);
$descricao_kit = trim($_POST['kit_descricao'] ?? null);

$id_fornecedor = intval($_POST['fornecedor_kit_id'] ?? 0);

$produto_ids_array = $_POST['produto_ids'] ?? [];
$quantidades_array = $_POST['quantidades'] ?? [];
$valores_array_br = $_POST['valores_unitarios'] ?? [];

/*
 * ===========================================
 * 2. VALIDAÇÃO BÁSICA
 * ===========================================
 */

if (empty($nome_kit) || empty($descricao_kit) || empty($id_fornecedor)) {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    exit;
}

if (empty($produto_ids_array)) {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    exit;
}

if (count($produto_ids_array) !== count($quantidades_array) || count($produto_ids_array) !== count($valores_array_br)) {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    exit;
}

/*
 * ===========================================
 * 3. LÓGICA DE BANCO DE DADOS (TRANSAÇÃO)
 * ===========================================
 */

try {
    $pdo->beginTransaction();

    $sql_kit = "INSERT INTO kits (nome, descricao, data_cadastro) VALUES (?, ?, NOW())";
    $stmt_kit = $pdo->prepare($sql_kit);
    $stmt_kit->execute([$nome_kit, $descricao_kit]);

    $ultimo_kit_id = $pdo->lastInsertId();

    $sql_itens = "INSERT INTO kit_produtos 
                    (fk_kit_id, fk_produto_id, fk_fornecedor_id, quantidade, valor_unitario) 
                  VALUES 
                    (?, ?, ?, ?, ?)";
    $stmt_itens = $pdo->prepare($sql_itens);

    foreach ($produto_ids_array as $index => $produto_id) {

        $quantidade = intval($quantidades_array[$index]);
        $valor_br_string = $valores_array_br[$index];

        $valor_db = str_replace('.', '', $valor_br_string);
        $valor_db = str_replace(',', '.', $valor_db);
        $valor_unitario = floatval($valor_db);

        if ($quantidade <= 0 || $valor_unitario < 0) {
            throw new Exception("Quantidade ou valor inválido para o produto ID $produto_id.");
        }

        $stmt_itens->execute([
            $ultimo_kit_id,
            intval($produto_id),
            $id_fornecedor,
            $quantidade,
            $valor_unitario
        ]);
    }

    $pdo->commit();

    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
} catch (Exception $e) {
    $pdo->rollBack();

    echo "Falha ao cadastrar o kit: " . $e->getMessage();
}
