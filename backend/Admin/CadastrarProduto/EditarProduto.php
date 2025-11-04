<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id_produto = intval($_POST['id_produto'] ?? 0);
    $nome_produto = trim($_POST['nome_produto'] ?? '');
    $Modelo = trim($_POST['Modelo'] ?? '');
    $valor_unitario = trim($_POST['valor_unitario'] ?? '');

    $redirect_url = "/projeto_PIII/frontend/dashboards/Admin/editar_produto/editar_produto.html?id=" . $id_produto;

    if ($id_produto <= 0 || empty($nome_produto) || empty($Modelo) || empty($valor_unitario)) {
        header("Location: " . $redirect_url . "&erro=campos_vazios");
        exit;
    }

    try {
        $pdo->beginTransaction();

        $sql_produto = "UPDATE produtos SET 
                            nome = :nome_produto, 
                            modelo = :Modelo, 
                            valor_unitario = :valor_unitario
                        WHERE id_produto = :id_produto";

        $stmt_produto = $pdo->prepare($sql_produto);
        $stmt_produto->execute([
            ':nome_produto' => $nome_produto,
            ':Modelo' => $Modelo,
            ':valor_unitario' => $valor_unitario,
            ':id_produto' => $id_produto
        ]);

        $pdo->commit();

        header("Location: " . $redirect_url . "&sucesso=1");
    } catch (PDOException $e) {
        $pdo->rollBack();
        header("Location: " . $redirect_url . "&erro=" . urlencode($e->getMessage()));
    }
} else {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/produtos/produtos.html");
}
?>