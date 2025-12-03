<?php

// Validação da sessão (impedir acesso sem login)

session_start();
if (!isset($_SESSION['usuario_logado'])) {
   echo "<script>alert('Acesso negado. Por favor, faça login.'); window.location.href = '../../login.html';</script>";
    exit();
}

