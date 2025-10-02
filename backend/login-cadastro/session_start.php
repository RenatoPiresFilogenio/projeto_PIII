<?php

// inicia sessão e verifica se usuário é válido

session_start();
require "../DB/database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $sql = "SELECT * FROM usuarios WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":email" => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !password_verify($senha, $usuario['senha'])) {
        header("Location: ../../frontend/login.html?status_login=erro");
        exit();
    }

    $_SESSION['usuario_logado'] = $usuario['nome'];
    $_SESSION['tipo_usuario'] = $usuario['tipo_usuario'];

    if ($usuario['tipo_usuario'] == 0) {
        header('Location: ../../frontend/dashboards/Cliente/cadastrarImoveis.php');
    } else {
        header('Location: ../../frontend/dashboards/Admin/dashboardAdmin.html');
    }
    exit();
}