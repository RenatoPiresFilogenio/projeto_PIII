<?php

require("../../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_usuario = $_SESSION['id_usuario'];

    $nova_senha = trim($_POST['senha'] ?? '');

    if (empty($nova_senha)) {
        header("Location: ../../../frontend/editar_senha.html?error=campo_vazio");
        exit();
    }

    try {

        $senhaHash = password_hash($nova_senha, PASSWORD_DEFAULT);


        $stmt = $pdo->prepare(
            "UPDATE usuarios SET senha = :senha WHERE id_usuario = :id_usuario"
        );

        $stmt->execute([
            'senha' => $senhaHash,
            'id_usuario' => $id_usuario
        ]);

        header("Location: ../../../frontend/login.html?success=senha_alterada");
        exit();
    } catch (PDOException $e) {

        header("Location: ../../../frontend/editar_senha.html?error=falha_db");
        exit();
    }
}

header("Location: ../../../frontend/editar_senha.html?error=metodo_invalido");
exit();
