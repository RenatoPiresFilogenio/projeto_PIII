<?php
session_start();
require("../DB/database.php");

// Verifica se o usuário está logado
if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuário não logado']);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];
$id_imovel  = $_POST['id'] ?? null;

if (!$id_imovel) {
    echo json_encode(['success' => false, 'error' => 'ID do imóvel não informado.']);
    exit;
}

try {
    // Confere se o imóvel realmente pertence ao usuário logado
    $stmt = $pdo->prepare("SELECT ID FROM IMOVEIS WHERE ID = :id_imovel AND FK_USUARIOS_ID_USUARIO = :id_usuario");
    $stmt->execute(['id_imovel' => $id_imovel, 'id_usuario' => $id_usuario]);
    $existe = $stmt->fetchColumn();

    if (!$existe) {
        echo json_encode(['success' => false, 'error' => 'Imóvel não encontrado ou não pertence ao usuário.']);
        exit;
    }

    // Deleta o imóvel
    $stmt = $pdo->prepare("DELETE FROM IMOVEIS WHERE ID = :id_imovel AND FK_USUARIOS_ID_USUARIO = :id_usuario");
    $stmt->execute(['id_imovel' => $id_imovel, 'id_usuario' => $id_usuario]);

    echo json_encode(['success' => true, 'message' => 'Imóvel excluído com sucesso.']);
    exit;

} catch (PDOException $e) {
    error_log("Erro ao excluir imóvel: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Erro ao excluir imóvel.']);
    exit;
}
?>
