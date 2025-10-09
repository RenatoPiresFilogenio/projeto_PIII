<?php
require("../../DB/database.php"); // ajuste conforme sua estrutura
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Consulta
$sql = "SELECT * FROM fornecedores";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$fornecedores = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Define cabeçalho JSON e envia apenas os dados
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($fornecedores);
