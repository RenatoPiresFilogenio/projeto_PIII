<?php
// api/api.php

require("../../DB/database.php");

$redirect_url = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

header('Content-Type: application/json');


$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
      
        $action = $_GET['action'] ?? '';

        switch ($action) {
            
            // Busca orçamentos 'AGUARDA_ADM' (fila do admin)
            case 'orcamentosAguardando':
                echo json_encode(getOrcamentosAguardando($pdo));
                break;

            // Busca estatísticas da fila
            case 'estatisticasAguardando':
                echo json_encode(getEstatisticasGerais($pdo));
                break;
            
            //  Busca detalhes de um orçamento (para o modal 'Ver Detalhes')
            case 'orcamentoDetalhes':
                $id = $_GET['id'] ?? 0;
                echo json_encode(getOrcamentoDetalhes($pdo, $id));
                break;

            //  Popula o filtro de fornecedores
            case 'getFornecedores':
                echo json_encode(getFornecedores($pdo));
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Ação GET desconhecida.']);
        }

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        switch ($action) {
            
            case 'atualizarStatus':
                echo json_encode(atualizarStatusOrcamento($pdo, $data));
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Ação POST desconhecida.']);
        }

    } else {
        http_response_code(405); 
        echo json_encode(['error' => 'Método não permitido.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}

exit;

function getOrcamentosAguardando($pdo) {
    $sql = "
        SELECT
            O.ID_ORCAMENTO AS id,
            U.NOME AS cliente,
            U.EMAIL AS email,
            U.TELEFONE AS telefone,
            F.NOME AS fornecedor,
            O.VALOR_TOTAL AS valor,
            O.DATA AS dataAprovacao, -- Usando a data do orçamento
            R.NOME AS regiao
        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        WHERE
            O.STATUS = 'AGUARDA_ADM' 
            AND O.IS_DELETE = FALSE
    ";

    $params = [];

   
    if (!empty($_GET['regiao'])) {
        $sql .= " AND LOWER(R.NOME) = ?";
        $params[] = strtolower($_GET['regiao']);
    }
    if (!empty($_GET['fornecedor'])) {
        $sql .= " AND F.NOME = ?";
        $params[] = $_GET['fornecedor'];
    }
    if (!empty($_GET['cliente'])) {
        $sql .= " AND LOWER(U.NOME) LIKE ?";
        $params[] = '%' . strtolower($_GET['cliente']) . '%';
    }

    $sql .= " ORDER BY O.DATA ASC"; 

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}


function getEstatisticasGerais($pdo)
{
    $sql = "
        SELECT
            COUNT(ID_ORCAMENTO) AS total,
            
            -- Contagens
            SUM(CASE WHEN STATUS = 'aprovado' THEN 1 ELSE 0 END) AS aprovados,
            SUM(CASE WHEN STATUS = 'recusado' THEN 1 ELSE 0 END) AS recusados,
            SUM(CASE WHEN STATUS = 'nao-liberado' THEN 1 ELSE 0 END) AS naoLiberados,
            
            -- Valores Monetários
            SUM(VALOR_TOTAL) AS valorTotal,
            SUM(CASE WHEN STATUS = 'aprovado' THEN VALOR_TOTAL ELSE 0 END) AS valoraprovado,
            SUM(CASE WHEN STATUS = 'recusado' THEN VALOR_TOTAL ELSE 0 END) AS valorrecusado

        FROM ORCAMENTO
        WHERE IS_DELETE = FALSE
    ";
    $stmt = $pdo->query($sql);
    return $stmt->fetch();
}

function getOrcamentoDetalhes($pdo, $id) {
    if (empty($id)) return ['error' => 'ID não fornecido'];

    $stmt = $pdo->prepare("
        SELECT
            O.ID_ORCAMENTO AS id,
            U.NOME AS cliente,
            U.EMAIL AS email,
            U.TELEFONE AS telefone,
            R.NOME AS regiao,
            F.NOME AS fornecedor,
            O.VALOR_TOTAL AS valor,
            V.PROPOSTAS_INCLUSOS AS itens -- Pega da sua View!
        FROM ORCAMENTO O
        JOIN VW_PROPOSTAS_ORCAMENTO V ON O.ID_ORCAMENTO = V.ID_ORCAMENTO
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        WHERE O.ID_ORCAMENTO = ?
    ");
    $stmt->execute([$id]);
    return $stmt->fetch();
}


function getFornecedores($pdo) {
    $stmt = $pdo->query("
        SELECT DISTINCT NOME 
        FROM FORNECEDORES 
        WHERE IS_DELETE IS NOT TRUE 
        ORDER BY NOME
    ");
    return $stmt->fetchAll(PDO::FETCH_COLUMN); 
}

function atualizarStatusOrcamento($pdo, $data) {
    $id = $data['id'] ?? 0;
    $status = $data['status'] ?? ''; 
    $observacoes = $data['observacoes'] ?? '';

    if (empty($id) || empty($status)) {
        http_response_code(400);
        return ['success' => false, 'error' => 'ID ou novo status não fornecido.'];
    }

    if ($status !== 'confirmado' && $status !== 'rejeitado') {
        http_response_code(400);
        return ['success' => false, 'error' => 'Status inválido.'];
    }

    $sql = "
        UPDATE ORCAMENTO
        SET
            STATUS = ?,
            OBSERVACOES_ADMIN = ?
        WHERE
            ID_ORCAMENTO = ?
            AND STATUS = 'AGUARDA_ADM' -- <--- ALTERAÇÃO 3
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$status, $observacoes, $id]);

    $rowCount = $stmt->rowCount();

    if ($rowCount > 0) {
        return ['success' => true];
    } else {
        return ['success' => false, 'error' => 'Orçamento não encontrado ou já processado.'];
    }
}