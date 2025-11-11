<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id_produto = intval($_POST['id_produto'] ?? 0);
    $nome_produto = trim($_POST['nome_produto'] ?? '');
    $Modelo = trim($_POST['Modelo'] ?? '');
    $valor_unitario = trim($_POST['valor_unitario'] ?? '');
    $potencia_kwh = trim($_POST['potencia_kwh'] ?? '0');
    $tipo_produto = trim($_POST['tipo_produto'] ?? '');
    $id_marca = intval($_POST['id_marca'] ?? 0);
    if ($id_produto <= 0 || empty($nome_produto) || empty($Modelo) || empty($valor_unitario) || $id_marca <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Erro: Todos os campos com * são obrigatórios.']);
        exit;
    }

    try {
        $sql_produto = "UPDATE produtos SET 
                            nome = :nome_produto, 
                            modelo = :Modelo, 
                            valor_unitario = :valor_unitario,
                            potencia_kwh = :potencia_kwh,
                            tipo_produto = :tipo_produto,
                            FK_MARCAS_ID_MARCA = :id_marca
                        WHERE id_produto = :id_produto";

        $stmt_produto = $pdo->prepare($sql_produto);
        $stmt_produto->execute([
            ':nome_produto' => $nome_produto,
            ':Modelo' => $Modelo,
            ':valor_unitario' => $valor_unitario,
            ':potencia_kwh' => $potencia_kwh,
            ':tipo_produto' => $tipo_produto,
            ':id_marca' => $id_marca,
            ':id_produto' => $id_produto
        ]);

        $fetch_sql = "SELECT p.*, m.nome as nome_marca, m.pais_origem, m.site_oficial, m.data_cadastro
                      FROM produtos p
                      JOIN marcas m ON p.FK_MARCAS_ID_MARCA = m.id_marca
                      WHERE p.id_produto = :id";
        $stmt_fetch = $pdo->prepare($fetch_sql);
        $stmt_fetch->execute([':id' => $id_produto]);
        $produto_atualizado = $stmt_fetch->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Produto atualizado com sucesso!',
            'produto' => $produto_atualizado
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'delete') {

    $id_produto = intval($_GET['id'] ?? 0);

    if ($id_produto <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_id', 'message' => 'ID inválido.']);
        exit;
    }

    try {
        $check_sql = "SELECT COUNT(*) 
                      FROM kit_produtos 
                      WHERE FK_PRODUTO_ID = :id 
                      AND (is_delete = FALSE OR is_delete IS NULL)";

        $check_stmt = $pdo->prepare($check_sql);
        $check_stmt->execute([':id' => $id_produto]);
        $count_kits = $check_stmt->fetchColumn();

        if ($count_kits > 0) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'in_use',
                'message' => 'Este produto está em uso por ' . $count_kits . ' kit(s) ativo(s) e não pode ser excluído.'
            ]);
            exit;
        }

        $sql = "UPDATE produtos SET is_delete = TRUE WHERE id_produto = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id_produto]);

        echo json_encode(['success' => true, 'message' => 'Produto excluído com sucesso.']);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'unknown', 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
exit;
