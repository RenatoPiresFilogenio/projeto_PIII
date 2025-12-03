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
    $limit = 5;
    $page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
    $offset = ($page - 1) * $limit;

    $whereClauses = ["O.IS_DELETE = FALSE"];
    $params = [];

    if (!empty($_GET['status'])) {
        if ($_GET['status'] === 'recusado') {
            $whereClauses[] = "(O.STATUS = 'recusado' OR O.STATUS = 'rejeitado')";
        } else {
            $whereClauses[] = "O.STATUS = ?";
            $params[] = $_GET['status'];
        }
    }

    if (!empty($_GET['regiao'])) {
        $whereClauses[] = "LOWER(R.NOME) = ?";
        $params[] = strtolower($_GET['regiao']);
    }

    $whereSql = " WHERE " . implode(" AND ", $whereClauses);

    // 1. Contagem Total
    $sqlCount = "
        SELECT COUNT(*) as total
        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        $whereSql
    ";

    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($params);
    $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. Query Principal OTIMIZADA
    $baseSql = "
        SELECT
            O.ID_ORCAMENTO AS id,
            U.NOME AS cliente,
            COALESCE(F.NOME, 'N/D') AS fornecedor, 
            O.VALOR_TOTAL AS valor,
            O.DATA AS data,
            O.STATUS AS status,
            R.NOME AS regiao,
            COALESCE(K.POTENCIA_IDEAL, 0) AS potencia_real,
            
            -- AQUI ESTÁ A MÁGICA: Buscamos a quantidade exata de painéis
            (
                SELECT COALESCE(SUM(KP.quantidade), 0)
                FROM KIT_PRODUTOS KP
                JOIN PRODUTOS P ON KP.fk_produto_id = P.id_produto
                WHERE KP.fk_kit_id = K.id_kit
                -- Filtra tudo que tem nome de placa solar
                AND (LOWER(P.nome) LIKE '%placa%' OR LOWER(P.nome) LIKE '%painel%' OR LOWER(P.nome) LIKE '%modulo%')
            ) AS qtd_paineis_reais

        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        LEFT JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR
        LEFT JOIN KIT_ORCAMENTO KO ON O.ID_ORCAMENTO = KO.FK_ORCAMENTO_ID
        LEFT JOIN KITS K ON KO.FK_KIT_ID = K.ID_KIT
        
        $whereSql
        ORDER BY O.DATA DESC
        LIMIT $limit OFFSET $offset
    ";

    $stmt = $pdo->prepare($baseSql);
    $stmt->execute($params);
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        'data' => $dados,
        'paginacao' => [
            'total_registros' => $totalRegistros,
            'pagina_atual' => $page,
            'total_paginas' => ceil($totalRegistros / $limit),
            'itens_por_pagina' => $limit
        ]
    ];
}

function getEstatisticasGerais($pdo)
{
    $sql = "
        SELECT
            COUNT(ID_ORCAMENTO) AS total,
            
            -- Contagens
            SUM(CASE WHEN STATUS = 'aprovado' OR STATUS = 'confirmado' THEN 1 ELSE 0 END) AS aprovados,
            -- --- CORREÇÃO AQUI --- (Conta recusado e rejeitado juntos)
            SUM(CASE WHEN STATUS = 'recusado' OR STATUS = 'rejeitado' THEN 1 ELSE 0 END) AS recusados,
            SUM(CASE WHEN STATUS = 'nao-liberado' OR STATUS = 'AGUARDA_ADM' THEN 1 ELSE 0 END) AS naoLiberados,
            
            -- Valores Monetários
            SUM(VALOR_TOTAL) AS valorTotal,
            SUM(CASE WHEN STATUS = 'aprovado' OR STATUS = 'confirmado' THEN VALOR_TOTAL ELSE 0 END) AS valoraprovado,
            -- --- CORREÇÃO AQUI --- (Soma recusado e rejeitado juntos)
            SUM(CASE WHEN STATUS = 'recusado' OR STATUS = 'rejeitado' THEN VALOR_TOTAL ELSE 0 END) AS valorrecusado

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
            SUM(CASE WHEN LOWER(O.STATUS) IN ('aprovado', 'confirmado') THEN 1 ELSE 0 END) AS aprovados,
            CASE 
                WHEN COUNT(O.ID_ORCAMENTO) = 0 THEN 0
                ELSE (SUM(CASE WHEN LOWER(O.STATUS) IN ('aprovado', 'confirmado') THEN 1 ELSE 0 END)::float / COUNT(O.ID_ORCAMENTO))
            END AS taxa
        FROM REGIAO R
        LEFT JOIN ESTADOS E ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        LEFT JOIN CIDADES C ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        LEFT JOIN BAIRROS B ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        LEFT JOIN IMOVEIS I ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        LEFT JOIN ORCAMENTO O ON O.FK_IMOVEIS_ID = I.ID AND O.IS_DELETE = FALSE
        GROUP BY R.NOME
        ORDER BY taxa DESC, total DESC
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
            SUM(CASE WHEN LOWER(O.STATUS) IN ('aprovado', 'confirmado') THEN 1 ELSE 0 END) AS aprovados,
            CASE 
                WHEN COUNT(O.ID_ORCAMENTO) = 0 THEN 0
                ELSE (SUM(CASE WHEN LOWER(O.STATUS) IN ('aprovado', 'confirmado') THEN 1 ELSE 0 END)::float / COUNT(O.ID_ORCAMENTO))
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
        ORDER BY taxa DESC, aprovados DESC, total DESC
        LIMIT 5
    ";
    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
}
