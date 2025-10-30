<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome        = trim($_POST['name'] ?? null);
    $email       = trim($_POST['email'] ?? null);
    $telefone    = trim($_POST['telefone'] ?? null);
    $marca = array($_POST['produtos'] ?? null);
    $total_vendas = 0;

    if (!$nome || !$email || !$telefone) {
        header("Location: ../../../frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html?status_cadastro_fornecedor=bad_request");
        exit();
    }

    try {
        $pdo->beginTransaction();

        $sql = 'SELECT email FROM fornecedores WHERE email = :email';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email]);

        if ($stmt->rowCount() > 0) {
            $pdo->rollBack();
            header("Location: ../../../frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html?status_cadastro_fornecedor=email_ja_cadastrado");
            exit();
        }

        $sql = 'INSERT INTO fornecedores (nome, email, telefone, total_vendas)
                VALUES (:nome, :email, :telefone, :total_vendas)';
        $stmt = $pdo->prepare($sql);
        $success = $stmt->execute([
            ':nome'         => $nome,
            ':email'        => $email,
            ':telefone'     => $telefone,
            ':total_vendas' => $total_vendas
        ]);

        if ($success) {
            $pdo->commit();
            header("Location: ../../../frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html?status_cadastro_fornecedor=sucesso_ao_cadastrar");
        } else {
            $pdo->rollBack();
            header("Location: ../../../frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html?status_cadastro_fornecedor=erro_ao_cadastrar");
        }
        exit();
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "Erro ao cadastrar fornecedor: " . $e->getMessage();
        exit();
    }
}
?>
