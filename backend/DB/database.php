<?php
$host = "localhost";
$port = "5432"; 
$dbname = "solar_smart_bd";
$usuario = "postgres"; 
$senha = "admin";       

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $usuario, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
}
?>
