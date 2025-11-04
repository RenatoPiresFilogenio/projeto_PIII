<?php
session_start();
require("../DB/database.php");

// PEGA O ID DO USUÁRIO LOGADO
if (!isset($_SESSION['id_usuario'])) {
    header("Location: ../../frontend/login.html?status=nao_logado");
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name       = trim($_POST['nome'] ?? '');
    $numero     = trim($_POST['numero'] ?? '');
    $cep        = trim($_POST['cep'] ?? '');
    $rua        = trim($_POST['rua'] ?? '');
    $bairro     = trim($_POST['bairro'] ?? '');
    $cidade     = trim($_POST['cidade'] ?? '');
    $estado     = trim($_POST['estado'] ?? '');
    $regiao     = trim($_POST['regiao'] ?? '');
    $consumo    = trim($_POST['consumo'] ?? '');
    $id_imovel  = trim($_POST['id'] ?? '');

    if (empty($name) || empty($rua) || empty($bairro) || empty($cidade) || 
        empty($estado) || empty($regiao) || empty($consumo)) {
        echo json_encode(['success' => false, 'error' => 'Todos os campos são obrigatórios.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // ---------------------------
        // 1. REGIÃO - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT id_regiao 
            FROM regiao 
            WHERE UPPER(TRIM(nome)) = UPPER(TRIM(:regiao))
        ");
        $stmt->execute(['regiao' => $regiao]);
        $id_regiao = $stmt->fetchColumn();

        if (!$id_regiao) {
            $stmt = $pdo->prepare("
                INSERT INTO regiao (nome) 
                VALUES (:regiao) 
                RETURNING id_regiao
            ");
            $stmt->execute(['regiao' => $regiao]);
            $id_regiao = $stmt->fetchColumn();
        }

        // ---------------------------
        // 2. ESTADO - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT id_estado 
            FROM estados 
            WHERE UPPER(TRIM(nm_estado)) = UPPER(TRIM(:estado)) 
              AND fk_regiao_id_regiao = :id_regiao
        ");
        $stmt->execute(['estado' => $estado, 'id_regiao' => $id_regiao]);
        $id_estado = $stmt->fetchColumn();

        if (!$id_estado) {
            $stmt = $pdo->prepare("
                INSERT INTO estados (nm_estado, fk_regiao_id_regiao) 
                VALUES (:estado, :id_regiao)
                RETURNING id_estado
            ");
            $stmt->execute(['estado' => $estado, 'id_regiao' => $id_regiao]);
            $id_estado = $stmt->fetchColumn();
        }

        // ---------------------------
        // 3. CIDADE - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT id_cidade 
            FROM cidades 
            WHERE UPPER(TRIM(nm_cidade)) = UPPER(TRIM(:cidade)) 
              AND fk_estados_id_estado = :id_estado
        ");
        $stmt->execute(['cidade' => $cidade, 'id_estado' => $id_estado]);
        $id_cidade = $stmt->fetchColumn();

        if (!$id_cidade) {
            $stmt = $pdo->prepare("
                INSERT INTO cidades (nm_cidade, fk_estados_id_estado) 
                VALUES (:cidade, :id_estado)
                RETURNING id_cidade
            ");
            $stmt->execute(['cidade' => $cidade, 'id_estado' => $id_estado]);
            $id_cidade = $stmt->fetchColumn();
        }

        // ---------------------------
        // 4. BAIRRO - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT id_bairro 
            FROM bairros 
            WHERE UPPER(TRIM(nm_bairro)) = UPPER(TRIM(:bairro)) 
              AND fk_cidades_id_cidade = :id_cidade
        ");
        $stmt->execute(['bairro' => $bairro, 'id_cidade' => $id_cidade]);
        $id_bairro = $stmt->fetchColumn();

        if (!$id_bairro) {
            $stmt = $pdo->prepare("
                INSERT INTO bairros (nm_bairro, fk_cidades_id_cidade) 
                VALUES (:bairro, :id_cidade)
                RETURNING id_bairro
            ");
            $stmt->execute(['bairro' => $bairro, 'id_cidade' => $id_cidade]);
            $id_bairro = $stmt->fetchColumn();
        }

        // ---------------------------
        // 5. IMÓVEL - inserir ou atualizar
        // ---------------------------
        if ($id_imovel) {
            // EDITAR
            $stmt = $pdo->prepare("
                UPDATE imoveis
                SET logradouro = :logradouro,
                    numero = :numero,
                    cep = :cep,
                    identificador = :identificador,
                    consumo = :consumo,
                    fk_bairros_id_bairro = :id_bairro
                    WHERE id = :id_imovel
                  AND fk_usuarios_id_usuario = :id_usuario
            ");
            $stmt->execute([
                'logradouro'   => $rua,
                'numero'       => $numero,
                'cep'          => $cep,
                'identificador'=> $name,
                'consumo'      => $consumo,
                'id_bairro'    => $id_bairro,
                'id_usuario'   => $id_usuario,
                'id_imovel'    => $id_imovel
            ]);

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Imóvel atualizado com sucesso!']);
        } else {
            // CADASTRAR
            $stmt = $pdo->prepare("
                INSERT INTO imoveis (
                    logradouro, numero, cep, identificador, consumo, 
                    fk_usuarios_id_usuario, fk_bairros_id_bairro
                )
                VALUES (:logradouro, :numero, :cep, :identificador, :consumo, :id_usuario, :id_bairro)
                RETURNING id
            ");
            $stmt->execute([
                'logradouro'   => $rua,
                'numero'       => $numero,
                'cep'          => $cep,
                'identificador'=> $name,
                'consumo'      => $consumo,
                'id_usuario'   => $id_usuario,
                'id_bairro'    => $id_bairro
            ]);

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Imóvel cadastrado com sucesso!']);
        }

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("Erro PDO: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Erro PDO: ' . $e->getMessage()]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("Erro geral: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Erro geral: ' . $e->getMessage()]);
    }

    exit;
}

echo json_encode(['success' => false, 'error' => 'Requisição inválida.']);
exit;
?>
