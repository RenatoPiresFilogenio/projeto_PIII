<?php
require("../../DB/database.php");
header('Content-Type: application/json');

$id_orcamento = $_GET['id'] ?? 0;

if ($id_orcamento <= 0) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID inválido']);
    exit;
}

try {
   
    $sql = "
        SELECT 
            O.ID_ORCAMENTO, O.DATA, O.VALOR_TOTAL, O.STATUS,
            
            -- Cliente
            U.NOME AS cliente_nome, U.EMAIL AS cliente_email, U.TELEFONE AS cliente_telefone,
            
            -- Imóvel
            I.IDENTIFICADOR AS imovel_nome, I.LOGRADOURO, I.NUMERO, I.CEP, I.CONSUMO,
            B.NM_BAIRRO, C.NM_CIDADE, E.SG_ESTADO, R.NOME AS regiao,
            
            -- Fornecedor
            F.NOME AS fornecedor_nome, F.EMAIL AS fornecedor_email, F.TELEFONE AS fornecedor_telefone,
            
            -- Kit Resumo
            K.DESCRICAO AS kit_nome, KO.POTENCIA_IDEAL

        FROM ORCAMENTO O
        JOIN IMOVEIS I ON O.FK_IMOVEIS_ID = I.ID
        JOIN USUARIOS U ON I.FK_USUARIOS_ID_USUARIO = U.ID_USUARIO
        JOIN BAIRROS B ON I.FK_BAIRROS_ID_BAIRRO = B.ID_BAIRRO
        JOIN CIDADES C ON B.FK_CIDADES_ID_CIDADE = C.ID_CIDADE
        JOIN ESTADOS E ON C.FK_ESTADOS_ID_ESTADO = E.ID_ESTADO
        LEFT JOIN REGIAO R ON E.FK_REGIAO_ID_REGIAO = R.ID_REGIAO
        LEFT JOIN FORNECEDORES F ON O.FK_FORNECEDOR_ID = F.ID_FORNECEDOR
        LEFT JOIN KIT_ORCAMENTO KO ON KO.FK_ORCAMENTO_ID = O.ID_ORCAMENTO
        LEFT JOIN KITS K ON KO.FK_KIT_ID = K.ID_KIT
        
        WHERE O.ID_ORCAMENTO = ?
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_orcamento]);
    $orcamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$orcamento) {
        http_response_code(404);
        echo json_encode(['erro' => 'Orçamento não encontrado']);
        exit;
    }

    // 2. Busca os Produtos do Kit (Itens)
    // A tabela correta de ligação é KIT_PRODUTOS, ligada via KIT_ORCAMENTO
    $sqlItens = "
        SELECT 
            P.NOME AS produto, 
            P.MODELO, 
            P.TIPO_PRODUTO,
            KP.QUANTIDADE,
            KP.VALOR_UNITARIO
        FROM KIT_ORCAMENTO KO
        JOIN KIT_PRODUTOS KP ON KO.FK_KIT_ID = KP.FK_KIT_ID
        JOIN PRODUTOS P ON KP.FK_PRODUTO_ID = P.ID_PRODUTO
        WHERE KO.FK_ORCAMENTO_ID = ?
    ";
    
    $stmtItens = $pdo->prepare($sqlItens);
    $stmtItens->execute([$id_orcamento]);
    $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);

    // Junta tudo
    $orcamento['itens'] = $itens;

    echo json_encode($orcamento);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
}
?>