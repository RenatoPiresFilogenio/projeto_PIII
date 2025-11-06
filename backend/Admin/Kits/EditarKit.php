<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$redirect_url = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: " . $redirect_url);
    exit;
}

/*
 * ===========================================
 * 1. RECEBIMENTO E VALIDAÇÃO DOS DADOS
 * ===========================================
 */
$id_kit = intval($_POST['kit_id'] ?? 0);
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
if ($id_kit <= 0 || empty($descricao_kit) || $id_fornecedor <= 0) {
    header("Location: " . $redirect_url . "?error=campos_obrigatorios_kit");
    exit;
}

if (empty($produto_ids_array)) {
    header("Location: " . $redirect_url . "?error=sem_produtos");
    exit;
}

if (count($produto_ids_array) !== count($quantidades_array) || count($produto_ids_array) !== count($valores_array_br)) {
    header("Location: " . $redirect_url . "?error=dados_inconsistentes");
    exit;
}

/*
 * ===========================================
 * 3. LÓGICA DE BANCO DE DADOS (TRANSAÇÃO)
 * ===========================================
 */
try {
    $pdo->beginTransaction();

    // 1. ATUALIZAR KIT
    $sql_update_kit = "
        UPDATE kits
        SET descricao = :descricao
        WHERE id_kit = :id_kit
    ";
    $stmt_update_kit = $pdo->prepare($sql_update_kit);
    $stmt_update_kit->execute([
        ':descricao' => $descricao_kit,
        ':id_kit' => $id_kit
    ]);

    // 2. REMOVER ITENS ANTIGOS DO KIT
    $sql_delete_itens = "DELETE FROM kit_produtos WHERE fk_kit_id = :id_kit";
    $stmt_delete_itens = $pdo->prepare($sql_delete_itens);
    $stmt_delete_itens->execute([':id_kit' => $id_kit]);

    // 3. INSERIR NOVOS ITENS DO KIT
    $sql_itens = "
        INSERT INTO kit_produtos 
            (fk_kit_id, fk_produto_id, fk_fornecedor_id, quantidade, valor_unitario)
        VALUES 
            (:kit_id, :produto_id, :fornecedor_id, :quantidade, :valor_unitario)
    ";
    $stmt_itens = $pdo->prepare($sql_itens);

    foreach ($produto_ids_array as $index => $produto_id) {
        $quantidade = intval($quantidades_array[$index]);
        $valor_br_string = $valores_array_br[$index];

        $valor_unitario = floatval(str_replace(',', '.', str_replace('.', '', $valor_br_string)));

        if ($quantidade <= 0 || $valor_unitario < 0) {
            throw new Exception("Quantidade ou valor inválido para o produto ID $produto_id.");
        }

        $stmt_itens->execute([
            ':kit_id' => $id_kit,
            ':produto_id' => intval($produto_id),
            ':fornecedor_id' => $id_fornecedor,
            ':quantidade' => $quantidade,
            ':valor_unitario' => $valor_unitario
        ]);
    }

    $pdo->commit();

    header("Location: " . $redirect_url . "?status=update_kit_ok");
    exit();
} catch (Exception $e) {
    $pdo->rollBack();
    exit("ERRO DE BANCO DE DADOS/LÓGICA: " . $e->getMessage());
}
    