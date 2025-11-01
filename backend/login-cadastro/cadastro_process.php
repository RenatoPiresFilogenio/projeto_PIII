<?php
require("../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name       = trim($_POST['name'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $telefone   = trim($_POST['telefone'] ?? '');
    $senha      = $_POST['senha'] ?? '';
    $senhaConf  = $_POST['password_confirmation'] ?? '';

    // Validação mínima
    if (!$name || !$email || !$telefone || !$senha || !$senhaConf || $senha !== $senhaConf) {
        exit('erro');
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    try {
        // Verifica email duplicado
        $stmt = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
        $stmt->execute(['email' => $email]);

        if ($stmt->rowCount() > 0) {
            exit('erro'); // ou 'duplicado' se quiser diferenciar
        }

        // Inserir usuário
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, telefone, senha, tipo_usuario)
                               VALUES (:nome, :email, :telefone, :senha, :tipo_usuario)");
        $stmt->execute([
            'nome' => $name,
            'email' => $email,
            'telefone' => $telefone,
            'senha' => $senhaHash,
            'tipo_usuario' => 0
        ]);
   
        header("Location: ../../frontend/login.html?status_cadastro=ok");
        exit;
        // cadastro bem-sucedido

    } catch (PDOException $e) {
        header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=falha");
    }
}

header("Location: ../../frontend/cadastroUsuario.html?status_cadastro=falha_no_protocolo_POST"); // se não for POST