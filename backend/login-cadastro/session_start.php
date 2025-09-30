<?php

// Inicia a sessão e verifica se os dados de login são válidos


session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    // Carrega usuários temporários
    $usuarios = require('usuario_temporario.php');

    $usuarioValido = null;

    foreach ($usuarios as $u) {
        if ($u['email'] === $email && password_verify($senha, $u['senha'])) {
            $usuarioValido = $u;
            break;
        }
    }

    if ($usuarioValido) {
        $_SESSION['usuario_logado'] = $usuarioValido['nome'];
        $_SESSION['tipo_usuario'] = $usuarioValido['tipo_usuario'];
        header('Location: ../../frontend/dashboards/Cliente/cadastrarImoveis.php');
        exit();
    } else {
        echo "Email ou senha incorretos!";
    }
}
?>
