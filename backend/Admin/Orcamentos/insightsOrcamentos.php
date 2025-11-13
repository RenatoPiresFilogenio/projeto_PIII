<?php

require("../../DB/database.php");

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        case 'regiaoMaiorAprovacao':
            echo json_encode(getRegiaoMaiorAprovacao($pdo));
            break;

        case 'fornecedoresTop':
            echo json_encode(getFornecedoresTop($pdo));
            break;

        case 'fornecedoresPorRegiao':
            echo json_encode(getFornecedoresPorRegiao($pdo));
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação desconhecida.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}

exit;


function getFornecedoresPorRegiao($pdo)
{
    $sql = "
        SELECT
            R.NOME AS regiao,
            COUNT(DISTINCT O.FK_FORNECEDOR_ID) AS contagem
        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        WHERE O.IS_DELETE = FALSE 
          AND O.FK_FORNECEDOR_ID IS NOT NULL 
        GROUP BY R.NOME
        ORDER BY contagem DESC, R.NOME
    ";

    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
}

function getRegiaoMaiorAprovacao($pdo)
{
    $sql = "
        SELECT
            R.NOME AS regiao,
            COUNT(O.ID_ORCAMENTO) AS total,
            SUM(CASE WHEN O.STATUS = 'aprovado' THEN 1 ELSE 0 END) AS aprovados,
            CASE 
                WHEN COUNT(O.ID_ORCAMENTO) = 0 THEN 0
                ELSE (SUM(CASE WHEN O.STATUS = 'aprovado' THEN 1 ELSE 0 END) * 1.0 / COUNT(O.ID_ORCAMENTO))
            END AS taxa
        FROM REGIAO R
        LEFT JOIN ESTADOS E ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        LEFT JOIN CIDADES C ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        LEFT JOIN BAIRROS B ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        LEFT JOIN IMOVEIS I ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        LEFT JOIN ORCAMENTO O ON O.FK_IMOVEIS_ID = I.ID AND O.IS_DELETE = FALSE
        GROUP BY R.NOME
        ORDER BY taxa DESC
    ";
    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
}

function getFornecedoresTop($pdo)
{
    $sql = "
        SELECT
            F.NOME AS fornecedor,
            R.NOME AS regiao,
            COUNT(O.ID_ORCAMENTO) AS total,
            SUM(CASE WHEN O.STATUS = 'aprovado' THEN 1 ELSE 0 END) AS aprovados,
            CASE 
                WHEN COUNT(O.ID_ORCAMENTO) = 0 THEN 0
                ELSE (SUM(CASE WHEN O.STATUS = 'aprovado' THEN 1 ELSE 0 END) * 1.0 / COUNT(O.ID_ORCAMENTO))
            END AS taxa
        FROM ORCAMENTO O
        JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        WHERE O.IS_DELETE = FALSE
        GROUP BY F.NOME, R.NOME
        ORDER BY taxa DESC, aprovados DESC
        LIMIT 5
    ";
    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
}
