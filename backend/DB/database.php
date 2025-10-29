<?php
$host = "localhost";
$port = "5432";
$dbname = "SOLARSMART";
$usuario = "postgres";
$senha = "======";

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $usuario, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
