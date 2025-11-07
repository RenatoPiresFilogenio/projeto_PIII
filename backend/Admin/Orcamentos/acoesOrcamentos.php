<?php

require("../../DB/database.php");

$redirect_url = "/projeto_PIII/frontend/dashboards/Admin/cadastro_fornecedores/cadastroFornecedores.html";

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        // buscar fornecedor por regiao
        case 'fornecedoresPorRegiao':
            echo json_encode(getFornecedoresPorRegiao($pdo));
            break;

        //  Ação para buscar os orçamentos filtrados
        case 'orcamentosEscolhidos':
            echo json_encode(getOrcamentos($pdo));
            break;

        //  Ação para o resumo geral
        case 'estatisticasGerais':
            echo json_encode(getEstatisticasGerais($pdo));
            break;

        //  Ação para clientes por região
        case 'clientesPorRegiao':
            echo json_encode(getClientesPorRegiao($pdo));
            break;

        //  Ação para ranking de regiões
        case 'regiaoMaiorAprovacao':
            echo json_encode(getRegiaoMaiorAprovacao($pdo));
            break;

        //  Ação para top fornecedores
        case 'fornecedoresTop':
            echo json_encode(getFornecedoresTop($pdo));
            break;

        default:
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'Ação desconhecida.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    // Em produção, logue o erro em vez de exibi-lo.
    echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}

exit;



function getOrcamentos($pdo)
{

    $baseSql = "
        SELECT
            O.ID_ORCAMENTO AS id,
            U.NOME AS cliente,
            COALESCE(F.NOME, 'N/D') AS fornecedor, -- Adicionado
            O.VALOR_TOTAL AS valor,
            O.DATA AS data,
            O.STATUS AS status,
            R.NOME AS regiao
        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        LEFT JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR -- Adicionado
    ";

    $conditions = ["O.IS_DELETE = FALSE"];
    $params = [];

    if (!empty($_GET['status'])) {
        $conditions[] = "O.STATUS = ?";
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['regiao'])) {
        $conditions[] = "LOWER(R.NOME) = ?";
        $params[] = strtolower($_GET['regiao']);
    }

    $sql = $baseSql . " WHERE " . implode(" AND ", $conditions) . " ORDER BY O.DATA DESC";

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


function getClientesPorRegiao($pdo)
{
    $sql = "
        SELECT
            R.NOME AS regiao,
            U.NOME AS cliente,
            SUM(CASE WHEN O.STATUS = 'aprovado' THEN 1 ELSE 0 END) AS aprovados,
            SUM(CASE WHEN O.STATUS = 'recusado' THEN 1 ELSE 0 END) AS recusados,
            SUM(CASE WHEN O.STATUS = 'nao-liberado' THEN 1 ELSE 0 END) AS naoLiberados
        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        WHERE O.IS_DELETE = FALSE
        GROUP BY R.NOME, U.NOME
        ORDER BY R.NOME, U.NOME
    ";
    $stmt = $pdo->query($sql);
    $results = $stmt->fetchAll();

    $clientesPorRegiao = [];
    foreach ($results as $row) {
        $regiao = $row['regiao'];
        $cliente = $row['cliente'];

        if (!isset($clientesPorRegiao[$regiao])) {
            $clientesPorRegiao[$regiao] = [];
        }

        $clientesPorRegiao[$regiao][$cliente] = [
            'aprovados' => (int)$row['aprovados'],
            'recusados' => (int)$row['recusados'],
            'naoLiberados' => (int)$row['naoLiberados']
        ];
    }
    return $clientesPorRegiao;
}

function getFornecedoresPorRegiao($pdo)
{
    $sql = "
        SELECT
            R.NOME AS regiao,
            COUNT(DISTINCT O.FK_FORNECEDOR_ID) AS contagem
        FROM ORCAMENTO O
        
        -- Precisamos da Região, então fazemos o join desde o Imóvel
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        
        WHERE O.IS_DELETE = FALSE 
          -- Importante: Só contar orçamentos que JÁ têm um fornecedor
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
                -- Multiplicar por 1.0 força a divisão decimal
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
