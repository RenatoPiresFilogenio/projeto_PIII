<?php
$host = "localhost";      // Servidor local (XAMPP)
$port = "3306";           // Porta padrão do MySQL
$dbname = "solarsmart"; // Nome do banco criado no phpMyAdmin
$usuario = "root";        // Usuário padrão do XAMPP
$senha = "";              // Senha padrão do XAMPP é vazia

try {
    // Conexão com MySQL (XAMPP)
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $usuario, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    $e->getMessage();
}
?>
