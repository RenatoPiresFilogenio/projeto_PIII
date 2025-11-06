<?php

require("../../DB/database.php");

$redirect_url = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: {$redirect_url}?error=metodo_invalido");
    exit();
}

$nome_produto   = trim($_POST['nome_produto'] ?? '');
$modelo_produto = trim($_POST['modelo_produto'] ?? '');
$valor_unitario = $_POST['valor_unitario'] ?? '';
$tipo_produto   = trim($_POST['tipo_produto'] ?? '');
$potencia       = $_POST['potencia_kwh'] ?? '';
$id_marca       = $_POST['id_marca'] ?? '';

if (!$nome_produto || !$modelo_produto || !$tipo_produto || !$id_marca || !$valor_unitario || !$potencia) {
    header("Location: {$redirect_url}?error=campos_vazios");
    exit();
}

if (!in_array($tipo_produto, ['1','2'])) {
    header("Location: {$redirect_url}?error=tipo_invalido");
    exit();
}

if (!is_numeric($valor_unitario) || !is_numeric($potencia)) {
    header("Location: {$redirect_url}?error=valor_invalido");
    exit();
}

$valor_unitario_float = (float) str_replace(',', '.', str_replace('.', '', $valor_unitario));
$potencia_float       = (float) $potencia;

try {
    $pdo->beginTransaction();

    $stmtCheck = $pdo->prepare("SELECT id_produto FROM produtos WHERE modelo = :modelo AND fk_marcas_id_marca = :marca");
    $stmtCheck->execute([
        ':modelo' => $modelo_produto,
        ':marca'  => $id_marca
    ]);
    
    if ($stmtCheck->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();
        header("Location: {$redirect_url}?error=duplicate");
        exit();
    }

    $stmtProduto = $pdo->prepare("
        INSERT INTO produtos
            (nome, modelo, valor_unitario, tipo_produto, fk_marcas_id_marca, potencia_kwh)
        VALUES
            (:nome, :modelo, :valor, :tipo, :marca, :potencia_kwh)
    ");
    $stmtProduto->execute([
        ':nome'         => $nome_produto,
        ':modelo'       => $modelo_produto,
        ':valor'        => $valor_unitario_float,
        ':tipo'         => $tipo_produto,
        ':marca'        => $id_marca,
        ':potencia_kwh' => $potencia_float
    ]);

    $id_produto = $pdo->lastInsertId(); 
    if (!$id_produto) {
        throw new Exception("Falha ao obter ID do produto inserido.");
    }

    $stmtCaract = $pdo->prepare("
        INSERT INTO produto_caracteristicas
            (fk_produto_id, fk_caracteristica_id, valor)
        VALUES
            (:produto_id, :caracteristica_id, :valor_caracteristica)
    ");
    $stmtCaract->execute([
        ':produto_id'           => $id_produto,
        ':caracteristica_id'    => $tipo_produto,
        ':valor_caracteristica' => $valor_unitario_float
    ]);

    $pdo->commit();
    header("Location: {$redirect_url}?status=cadastro_ok");
    exit();

} catch (Exception $e) {
    $pdo->rollBack();
    
    echo "<pre>Erro: " . $e->getMessage() . "</pre>";
    exit();
    
    error_log("Erro Crítico no Cadastro de Produto/Característica: " . $e->getMessage());
    header("Location: {$redirect_url}?error=db_failure");
    exit();
}

