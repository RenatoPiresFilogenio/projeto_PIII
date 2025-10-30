<?php
session_start();
require("../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        header("Location: ../../frontend/login.html?status_login=campos_vazios");
        exit;
    }

    $stmt = $pdo->prepare("SELECT id_usuario, nome, email, senha, tipo_usuario FROM usuarios WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($senha, $usuario['senha'])) {
        $_SESSION['usuario_logado'] = $usuario['nome'];
        $_SESSION['tipo_usuario'] = $usuario['tipo_usuario'];
        $_SESSION['id_usuario'] = $usuario['id_usuario'];
        header("Location: ../../frontend/dashboards/Cliente/cadastrarImoveis.php");
        exit;
    } else {
        header("Location: ../../frontend/login.html?status_login=erro");
        exit;
    }
}

header("Location: ../../frontend/login.html?status_login=falha_no_protocolo_POST");
exit;
