<?php
require("../../DB/database.php");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id_fornecedor = intval($_POST['id_fornecedor'] ?? 0);
    
    // Corrigido para bater com o HTML que você mandou
    $nome = trim($_POST['nome_fornecedor'] ?? ''); 
    
    $telefone = trim($_POST['telefone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $id_kit = intval($_POST['kits'] ?? 0); 

    $redirect_url = "/projeto_PIII/frontend/dashboards/Admin/editar_fornecedor/editar_fornecedor.html?id=" . $id_fornecedor;

    if ($id_fornecedor <= 0 || empty($nome) || empty($telefone) || empty($email) || $id_kit <= 0) {
        header("Location: " . $redirect_url . "&erro=campos_vazios");
        exit;
    }

    try {
        $pdo->beginTransaction();

        $sql_fornecedor = "UPDATE fornecedores SET 
                                nome = :nome, 
                                email = :email, 
                                telefone = :telefone 
                            WHERE id_fornecedor = :id_fornecedor";

        $stmt_fornecedor = $pdo->prepare($sql_fornecedor);
        $stmt_fornecedor->execute([
            ':nome' => $nome,
            ':email' => $email,
            ':telefone' => $telefone,
            ':id_fornecedor' => $id_fornecedor
        ]);


        $sql_find_existing = "SELECT fk_produto_id FROM kit_produtos 
                              WHERE fk_fornecedor_id = :id_fornecedor 
                              AND fk_kit_id = :id_kit";
        
        $stmt_find = $pdo->prepare($sql_find_existing);
        $stmt_find->execute([
            ':id_fornecedor' => $id_fornecedor,
            ':id_kit' => $id_kit
        ]);
        
        $existing_products = $stmt_find->fetchAll(PDO::FETCH_COLUMN, 0);

        if (count($existing_products) > 0) {
            $placeholders = rtrim(str_repeat('?,', count($existing_products)), ',');
            
            $sql_delete_conflicts = "DELETE FROM kit_produtos 
                                     WHERE fk_fornecedor_id = ? 
                                     AND fk_kit_id != ? 
                                     AND fk_produto_id IN ($placeholders)";
            
            $params = [$id_fornecedor, $id_kit];
            $params = array_merge($params, $existing_products);
            
            $stmt_delete = $pdo->prepare($sql_delete_conflicts);
            $stmt_delete->execute($params);
        }

        $sql_kit_update = "UPDATE kit_produtos SET 
                                fk_kit_id = :id_kit 
                           WHERE fk_fornecedor_id = :id_fornecedor 
                           AND fk_kit_id != :id_kit";

        $stmt_kit_update = $pdo->prepare($sql_kit_update);
        $stmt_kit_update->execute([
            ':id_kit' => $id_kit,
            ':id_fornecedor' => $id_fornecedor
        ]);
        
        $pdo->commit();

        header("Location: " . $redirect_url . "&sucesso=1");

    } catch (PDOException $e) {
        $pdo->rollBack();
        header("Location: " . $redirect_url . "&erro=" . urlencode($e->getMessage()));
    }
} else {
    header("Location: /projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html");
}
?>