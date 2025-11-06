<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$redirect_url = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome     = trim($_POST['name'] ?? null);
    $email    = trim($_POST['email'] ?? null);
    $telefone = trim($_POST['telefone'] ?? null);
    $total_vendas = 0;

    if (!$nome || !$email || !$telefone) {
        header("Location: {$redirect_url}?status=campos_vazios");
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Verifica email duplicado
        $stmt = $pdo->prepare('SELECT id_fornecedor FROM fornecedores WHERE email = :email');
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            $pdo->rollBack();
            header("Location: {$redirect_url}?status=email_duplicado");
            exit();
        }

        // 2. Insere o fornecedor e retorna o ID
        $stmt = $pdo->prepare('
            INSERT INTO fornecedores (nome, email, telefone, total_vendas)
            VALUES (:nome, :email, :telefone, :total_vendas)
            RETURNING id_fornecedor
        ');

        $stmt->execute([
            ':nome'         => $nome,
            ':email'        => $email,
            ':telefone'     => $telefone,
            ':total_vendas' => $total_vendas
        ]);

        $id_fornecedor = $stmt->fetchColumn();
        if (!$id_fornecedor) {
            throw new Exception("Falha ao inserir fornecedor.");
        }

        $pdo->commit();
        header("Location: {$redirect_url}?status=cadastro_ok");
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro no cadastro de fornecedor: " . $e->getMessage());
        header("Location: {$redirect_url}?status=db_failure");
        exit();
    }

} else {
    header("Location: {$redirect_url}?status=metodo_invalido");
    exit();
}
