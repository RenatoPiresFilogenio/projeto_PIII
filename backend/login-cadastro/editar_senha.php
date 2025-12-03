<?php

require("../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Captura o email e a nova senha do formulário
    $email = trim($_POST['email'] ?? '');
    $nova_senha = trim($_POST['senha'] ?? '');
    
    // 1. Verifica se os campos estão vazios
    if (empty($email) || empty($nova_senha)) {
        header("Location: ../../frontend/editar_senha.html?error=campo_vazio");
        exit();
    }

    try {
        // 2. Busca o ID do usuário pelo e-mail
        $stmt_select = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
        $stmt_select->execute(['email' => $email]);
        $user = $stmt_select->fetch(PDO::FETCH_ASSOC);

        // Verifica se o e-mail foi encontrado
        if (!$user) {
            header("Location: ../../frontend/editar_senha.html?error=email_nao_encontrado");
            exit();
        }
        
        $id_usuario = $user['id_usuario'];

        // 3. Gera o hash da nova senha
        $senhaHash = password_hash($nova_senha, PASSWORD_DEFAULT);

        // 4. Atualiza a senha no banco de dados
        $stmt_update = $pdo->prepare(
            "UPDATE usuarios SET senha = :senha WHERE id_usuario = :id_usuario"
        );

        $stmt_update->execute([
            'senha' => $senhaHash,
            'id_usuario' => $id_usuario
        ]);

        // Redireciona para o login com sucesso
        header("Location: ../../frontend/login.html?success=senha_alterada");
        exit();
    } catch (PDOException $e) {
        // Redireciona em caso de erro no banco de dados
        // É recomendável logar o erro real ($e->getMessage()) para debug.
        header("Location: ../../frontend/editar_senha.html?error=falha_db");
        exit();
    }
}

// Redireciona se o método de requisição for inválido (e.g., GET)
header("Location: ../../frontend/editar_senha.html?error=metodo_invalido");
exit();