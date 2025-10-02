<?php
require("../../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome        = trim($_POST['name'] ?? '');
    $email       = trim($_POST['email'] ?? '');
    $telefone    = trim($_POST['telefone'] ?? '');
    $totalvendas = $_POST['totalvendas'] ?? '';

    if (!$nome || !$email || !$telefone || !$totalvendas) {
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

        $sql = 'INSERT INTO fornecedores (nome, email, telefone, totalvendas)
                VALUES (:nome, :email, :telefone, :totalvendas)';
        $stmt = $pdo->prepare($sql);
        $success = $stmt->execute([
            ':nome'        => $nome,
            ':email'       => $email,
            ':telefone'    => $telefone,
            ':totalvendas' => $totalvendas
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
        
        error_log("Erro ao cadastrar fornecedor: " . $e->getMessage());
        header("Location: ../../../frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html?status_cadastro_fornecedor=erro_ao_cadastrar");
        exit();
    }
}
