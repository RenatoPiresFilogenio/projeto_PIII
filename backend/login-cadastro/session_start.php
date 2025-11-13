<?php

require "../DB/database.php";

if (isset($_POST['lembrar']) && $_POST['lembrar'] == '1') {
    $lifetime = 60 * 60 * 24 * 30; 
} else {
    $lifetime = 0;
}

session_set_cookie_params($lifetime, '/', '', false, true); 
session_start();

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

    
    session_regenerate_id(true); 
    
    $_SESSION['usuario_logado'] = $usuario['nome'];
    $_SESSION['tipo_usuario'] = $usuario['tipo_usuario'];
    $_SESSION['id_usuario'] = $usuario['id_usuario'];

    
    if ($usuario['tipo_usuario'] == 0) { 
        header('Location: ../../frontend/dashboards/Cliente/cadastrarImoveis.php');
    } else { 
        header('Location: ../../frontend/dashboards/Admin/dashboardAdmin.html');
    }
    exit();
}
?>