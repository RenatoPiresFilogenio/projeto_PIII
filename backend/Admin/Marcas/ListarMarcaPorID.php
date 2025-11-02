<?php

require("../../DB/database.php");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $id_marca = intval($_GET['id_marca'] ?? 0);

    if (!$id_marca) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
    }

    try {
        $pdo->beginTransaction();

        $sql = "SELECT * FROM marcas WHERE id_marca = :id";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([':id' => $id_marca]);

        $marca = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($marca) {
            echo json_encode($marca);
        } else {
            http_response_code(404);
            echo json_encode(['erro' => 'Marca não encontrada.']);
        }
    } catch (\Throwable $th) {
        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao consultar o banco de dados: ' . $e->getMessage()]);
    }
} else {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
}
