<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome        = trim($_POST['name'] ?? null);
    $email       = trim($_POST['email'] ?? null);
    $telefone    = trim($_POST['telefone'] ?? null);
    $marca = array($_POST['produtos'] ?? null);
}
