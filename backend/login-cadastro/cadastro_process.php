<?php
require("../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name       = trim($_POST['name'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $telefone   = trim($_POST['telefone'] ?? '');
    $senha      = $_POST['senha'] ?? '';
    $senhaConf  = $_POST['password_confirmation'] ?? '';

    if (empty($name) || empty($email) || empty($telefone) || empty($senha) || empty($senhaConf)) {
        header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=campos_vazios");
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=email_invalido");
        exit;
    }

    if ($senha !== $senhaConf) {
        header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=senha_diferente");
        exit;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
        $stmt->execute(['email' => $email]);

        if ($stmt->rowCount() > 0) {
            header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=duplicado");
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (nome, email, telefone, senha, tipo_usuario)
            VALUES (:nome, :email, :telefone, :senha, :tipo_usuario)
        ");
        $stmt->execute([
            'nome' => $name,
            'email' => $email,
            'telefone' => $telefone,
            'senha' => $senhaHash,
            'tipo_usuario' => 0
        ]);

        header("Location: ../../frontend/login.html?status_cadastro=ok");
        exit;
    } catch (PDOException $e) {
        echo "Erro: " . $e->getMessage();
        //header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=falha");
        exit;
    }
}

header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=falha_no_protocolo_POST");
exit;
