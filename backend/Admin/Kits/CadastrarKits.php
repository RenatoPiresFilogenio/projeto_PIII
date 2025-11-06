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
if (empty($descricao_kit) || $id_fornecedor <= 0) {
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

    // ==================================================================
    // ETAPA ADICIONAL: CALCULAR POTÊNCIA E VALIDAR COMPOSIÇÃO DO KIT
    // ==================================================================

    $potencia_ideal_total = 0.0; // Inicializa a potência total do kit

    // <-- MUDANÇA: Flags para validar o kit
    $tem_placa_solar = false; // Flag para tipo '1'
    $tem_inversor = false;    // Flag para tipo '2'

    // Prepara a query para buscar os dados de potência de cada produto
    $sql_produto_info = "SELECT tipo_produto, potencia_kwh FROM produtos WHERE id_produto = :produto_id";
    $stmt_produto_info = $pdo->prepare($sql_produto_info);

    // Loop nos produtos que vieram do formulário
    foreach ($produto_ids_array as $index => $produto_id) {

        // Busca o tipo e a potência do produto no banco
        $stmt_produto_info->execute([':produto_id' => intval($produto_id)]);
        $produto = $stmt_produto_info->fetch(PDO::FETCH_ASSOC);

        if ($produto) {

            // VERIFICA SE É UMA PLACA SOLAR (tipo_produto = '1')
            if ($produto['tipo_produto'] === '1') {
                $tem_placa_solar = true; // <-- MUDANÇA: Marca a flag

                $quantidade = intval($quantidades_array[$index]);
                $potencia_kwh_string = $produto['potencia_kwh'];

                // Limpeza robusta do valor (ex: "550,5 Wp" -> 550.5)
                $potencia_limpa = str_replace(',', '.', $potencia_kwh_string);
                $potencia_produto = floatval(preg_replace("/[^0-9\.]/", "", $potencia_limpa));

                // Soma à potência total do kit
                $potencia_ideal_total += ($potencia_produto * $quantidade);
            }

            // VERIFICA SE É UM INVERSOR (tipo_produto = '2')
            if ($produto['tipo_produto'] === '2') {
                $tem_inversor = true; // <-- MUDANÇA: Marca a flag
            }
        }
    }
    // ==================================================================
    // FIM DA ETAPA ADICIONAL
    // ==================================================================

    // ==================================================================
    // <-- MUDANÇA: NOVA VALIDAÇÃO OBRIGATÓRIA
    // ==================================================================
    if (!$tem_placa_solar || !$tem_inversor) {
        // Se faltar placa OU faltar inversor, lança uma exceção.
        // A transação será revertida (rollBack) no "catch"
        throw new Exception("kit_incompleto");
    }
    // ==================================================================
    // FIM DA NOVA VALIDAÇÃO
    // ==================================================================


    // 1. INSERIR KIT (Agora incluindo a coluna 'potencia_ideal' com o valor calculado)
    $sql_kit = "
        INSERT INTO kits (descricao, data_cadastro, is_delete, potencia_ideal)
        VALUES (:descricao, NOW(), false, :potencia_ideal)
        RETURNING id_kit
    ";
    $stmt_kit = $pdo->prepare($sql_kit);
    $stmt_kit->execute([
        ':descricao' => $descricao_kit,
        ':potencia_ideal' => $potencia_ideal_total
    ]);

    $ultimo_kit_id = $stmt_kit->fetchColumn();
    if (!$ultimo_kit_id) {
        throw new Exception("Falha ao inserir o kit.");
    }

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
            ':kit_id' => $ultimo_kit_id,
            ':produto_id' => intval($produto_id),
            ':fornecedor_id' => $id_fornecedor,
            ':quantidade' => $quantidade,
            ':valor_unitario' => $valor_unitario
        ]);
    }

    $pdo->commit();

    header("Location: " . $redirect_url . "?status=cadastro_kit_ok");
    exit();
} catch (Exception $e) {
    $pdo->rollBack();

    if ($e->getMessage() === "kit_incompleto") {
        header("Location: " . $redirect_url . "?error=kit_incompleto");
        exit();
    }

    exit("ERRO DE BANCO DE DADOS/LÓGICA: " . $e->getMessage());
}
