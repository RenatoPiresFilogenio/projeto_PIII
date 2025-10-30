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
    $id_imovel  = $_POST['id'] ?? null; // se vier, é edição
    $name       = trim($_POST['nome'] ?? '');
    $numero     = trim($_POST['numero'] ?? '');
    $cep        = trim($_POST['cep'] ?? '');
    $rua        = trim($_POST['rua'] ?? '');
    $bairro     = trim($_POST['bairro'] ?? '');
    $cidade     = $_POST['cidade'] ?? '';
    $estado     = $_POST['estado'] ?? '';
    $regiao     = $_POST['regiao'] ?? '';
    $consumo    = $_POST['consumo'] ?? '';

    if (empty($name) || empty($rua) || empty($bairro) || empty($cidade) || 
        empty($estado) || empty($regiao) || empty($consumo)) {
        echo json_encode(['success' => false, 'error' => 'Todos os campos são obrigatórios.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // ---------------------------
        // 1. REGIAO - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("SELECT ID_REGIAO_ FROM REGIAO WHERE UPPER(TRIM(NOME_)) = UPPER(TRIM(:regiao))");
        $stmt->execute(['regiao' => $regiao]);
        $id_regiao = $stmt->fetchColumn();

        if (!$id_regiao) {
            $stmt = $pdo->prepare("INSERT INTO REGIAO (NOME_) VALUES (:regiao) RETURNING ID_REGIAO_");
            $stmt->execute(['regiao' => $regiao]);
            $id_regiao = $stmt->fetchColumn();
        }

        // ---------------------------
        // 2. ESTADO - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT ID_ESTADO 
            FROM ESTADOS 
            WHERE UPPER(TRIM(NM_ESTADO)) = UPPER(TRIM(:estado)) 
              AND FK_REGIAO_ID_REGIAO = :id_regiao
        ");
        $stmt->execute(['estado' => $estado, 'id_regiao' => $id_regiao]);
        $id_estado = $stmt->fetchColumn();

        if (!$id_estado) {
            $stmt = $pdo->prepare("
                INSERT INTO ESTADOS (NM_ESTADO, FK_REGIAO_ID_REGIAO) 
                VALUES (:estado, :id_regiao)
                RETURNING ID_ESTADO
            ");
            $stmt->execute(['estado' => $estado, 'id_regiao' => $id_regiao]);
            $id_estado = $stmt->fetchColumn();
        }

        // ---------------------------
        // 3. CIDADE - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT ID_CIDADE 
            FROM CIDADES 
            WHERE UPPER(TRIM(NM_CIDADE)) = UPPER(TRIM(:cidade)) 
              AND FK_ESTADOS_ID_ESTADO = :id_estado
        ");
        $stmt->execute(['cidade' => $cidade, 'id_estado' => $id_estado]);
        $id_cidade = $stmt->fetchColumn();

        if (!$id_cidade) {
            $stmt = $pdo->prepare("
                INSERT INTO CIDADES (NM_CIDADE, FK_ESTADOS_ID_ESTADO) 
                VALUES (:cidade, :id_estado)
                RETURNING ID_CIDADE
            ");
            $stmt->execute(['cidade' => $cidade, 'id_estado' => $id_estado]);
            $id_cidade = $stmt->fetchColumn();
        }

        // ---------------------------
        // 4. BAIRRO - buscar ou inserir
        // ---------------------------
        $stmt = $pdo->prepare("
            SELECT ID_BAIRRO 
            FROM BAIRROS 
            WHERE UPPER(TRIM(NM_BAIRRO)) = UPPER(TRIM(:bairro)) 
              AND FK_CIDADES_ID_CIDADE = :id_cidade
        ");
        $stmt->execute(['bairro' => $bairro, 'id_cidade' => $id_cidade]);
        $id_bairro = $stmt->fetchColumn();

        if (!$id_bairro) {
            $stmt = $pdo->prepare("
                INSERT INTO BAIRROS (NM_BAIRRO, FK_CIDADES_ID_CIDADE) 
                VALUES (:bairro, :id_cidade)
                RETURNING ID_BAIRRO
            ");
            $stmt->execute(['bairro' => $bairro, 'id_cidade' => $id_cidade]);
            $id_bairro = $stmt->fetchColumn();
        }

        // ---------------------------
        // 5. IMOVEL - inserir ou atualizar
        // ---------------------------
        if ($id_imovel) {
            // EDITAR
            $stmt = $pdo->prepare("
                UPDATE IMOVEIS
                SET LOGRADOURO = :logradouro,
                    NUMERO = :numero,
                    CEP = :cep,
                    IDENTIFICADOR = :identificador,
                    FK_BAIRROS_ID_BAIRRO = :id_bairro
                WHERE ID = :id_imovel
                  AND FK_USUARIOS_ID_USUARIO = :id_usuario
            ");
            $stmt->execute([
                'logradouro'   => $rua,
                'numero'       => $numero,
                'cep'          => $cep,
                'identificador'=> $name,
                'id_bairro'    => $id_bairro,
                'id_imovel'    => $id_imovel,
                'id_usuario'   => $id_usuario
            ]);

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Imóvel atualizado com sucesso!']);
        } else {
            // CADASTRAR
            $stmt = $pdo->prepare("
                INSERT INTO IMOVEIS (LOGRADOURO, NUMERO, CEP, IDENTIFICADOR, FK_USUARIOS_ID_USUARIO, FK_BAIRROS_ID_BAIRRO)
                VALUES (:logradouro, :numero, :cep, :identificador, :id_usuario, :id_bairro)
                RETURNING ID
            ");
            $stmt->execute([
                'logradouro'   => $rua,
                'numero'       => $numero,
                'cep'          => $cep,
                'identificador'=> $name,
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
