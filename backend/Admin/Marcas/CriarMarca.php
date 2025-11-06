<?php
require("../../DB/database.php");

$redirect_url = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $site_oficial   = trim($_POST['site_oficial'] ?? '');
    $pais_origem    = trim($_POST['pais_origem'] ?? '');
    $nome           = trim($_POST['nome'] ?? '');
    $modelo         = trim($_POST['modelo'] ?? '');

    if (empty($site_oficial) || empty($pais_origem) || empty($nome) || empty($modelo)) {
        header("Location: " . $redirect_url . "?status=campos_vazios");
        exit();
    }

    try {
        $pdo->beginTransaction();

        $sql = "SELECT id_marca FROM marcas WHERE nome = :nome AND modelo = :modelo";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':nome' => $nome, ':modelo' => $modelo]);
        $marca = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($marca) {
            header("Location: " . $redirect_url . "?status=marca_existente");
            exit();
        } else {

            // CORREÇÃO: Enviando o booleano 'false' em vez de uma string
            // Eu também assumi que fk_fornecedores... pode ser nulo.
            $sql = "INSERT INTO marcas (nome, modelo, data_cadastro, site_oficial, pais_origem, is_delete)
                    VALUES (:nome, :modelo, CURRENT_DATE, :site_oficial, :pais, :is_delete)";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'         => $nome,
                ':modelo'       => $modelo,
                ':site_oficial' => $site_oficial,
                ':pais'         => $pais_origem,
                ':is_delete'    => '0'  // <-- AQUI ESTÁ A CORREÇÃO
            ]);

            // ATENÇÃO: ESTA LINHA ABAIXO É O SEU PRÓXIMO ERRO.
            // O 'id_marca' na sua tabela NÃO É SERIAL, então o banco não gerou ID.
            $id_marca = $pdo->lastInsertId('marcas_id_marca_seq');
        }

        $pdo->commit();
        header("Location: " . $redirect_url . "?status=cadastro_ok");
        exit();
    } catch (Exception $e) {
        $pdo->rollBack();

        // VAI MOSTRAR O PRÓXIMO ERRO (sobre o lastInsertId)
        exit("ERRO DE BANCO DE DADOS: " . $e->getMessage());
    }
} else {
    header("Location: " . $redirect_url . "?status=metodo_invalido");
    exit();
}
