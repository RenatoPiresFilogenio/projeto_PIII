<?php

// Encerra a sessão e redireciona para a página inicial

session_start();
session_destroy(); // Encerra a sessão

require_once __DIR__ . '/../config.php'; 
header('Location: ' . BASE_URL . '/frontend/index.html');
exit();
