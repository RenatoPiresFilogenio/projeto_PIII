<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id_marca = intval($_POST['id_marca'] ?? 0);

    if ($id_marca <= 0) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_marca/editar_marca.html?id=" . $id_marca);
        exit;
    }

    try {
        $stmt_select = $pdo->prepare("SELECT * FROM marcas WHERE id_marca = :id");
        $stmt_select->execute([':id' => $id_marca]);
        $marca_antiga = $stmt_select->fetch(PDO::FETCH_ASSOC);

        if (!$marca_antiga) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_marca/editar_marca.html?id=" . $id_marca);
            exit;
        }

        $nome_novo = trim($_POST['nome_marca'] ?? $marca_antiga['nome_marca']);
        $modelo_novo = trim($_POST['Modelo'] ?? $marca_antiga['modelo']);
        $site_novo = trim($_POST['site_oficial'] ?? $marca_antiga['site_oficial']);
        $pais_novo = trim($_POST['pais_origem'] ?? $marca_antiga['pais_de_origem']);

        $sql = "UPDATE marcas SET 
                    nome = ?, 
                    modelo = ?, 
                    site_oficial = ?, 
                    pais_origem = ?
                WHERE id_marca = ?";

        $stmt_update = $pdo->prepare($sql);

        $stmt_update->execute([
            $nome_novo,
            $modelo_novo,
            $site_novo,
            $pais_novo,
            $id_marca
        ]);

        if ($stmt_update->rowCount() > 0) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_marca/editar_marca.html?id=" . $id_marca);
        } else {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_marca/editar_marca.html?id=" . $id_marca);
        }
    } catch (PDOException $e) {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_marca/editar_marca.html?id=" . $id_marca);
    }
} else {
        header("Location: /projeto_PIII/frontend/dashboards/Admin/editar_marca/editar_marca.html?id=" . $id_marca);
}
