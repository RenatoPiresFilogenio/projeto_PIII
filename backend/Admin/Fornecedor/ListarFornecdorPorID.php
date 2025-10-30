<?php
require("../../DB/database.php");
header('Content-Type: application/json; charset=UTF-8');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if (isset($_GET['id'])) {

    $id = $_GET['id'];

    $sql = "SELECT * FROM FORNECEDORES WHERE id_fornecedor = ? ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);

    $fornecedor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($fornecedor) {
        echo json_encode($fornecedor);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Fornecedor não encontrado com esse ID']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'ID do fornecedor não fornecido na URL']);
    exit();
}
