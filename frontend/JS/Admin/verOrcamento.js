document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('Orçamento não especificado.');
        return;
    }

    carregarDetalhes(id);
});

async function carregarDetalhes(id) {
    try {
        // Caminho correto da API
        const response = await fetch(`../../../backend/Admin/Orcamentos/detalhes_orcamento.php?id=${id}`);
        
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const dados = await response.json();
        
        if (dados.erro) {
            alert(dados.erro);
            return;
        }

        preencherTela(dados);

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar detalhes do orçamento.');
    }
}

function preencherTela(d) {
    // Nota: O PHP geralmente retorna as chaves em minúsculo (id_orcamento, valor_total, etc)
    
    // --- CABEÇALHO ---
    document.getElementById('orc-id').textContent = d.id_orcamento || d.ID_ORCAMENTO;
    
    const dataObj = new Date(d.data || d.DATA);
    document.getElementById('data-pedido').textContent = !isNaN(dataObj) ? dataObj.toLocaleDateString('pt-BR') : '-';
    
    // --- STATUS BADGE ---
    const statusContainer = document.getElementById('status-container');
    let statusColor = '#718096'; // Cinza default
    let textColor = '#2d3748'; // Cor padrão do texto do valor
    let statusText = d.status || d.STATUS;

    const st = statusText ? statusText.toLowerCase() : '';
    
    if (st === 'aprovado' || st === 'confirmado') {
        statusColor = '#28a745'; // Verde
        textColor = '#28a745';   // Valor fica verde
    } 
    else if (st === 'recusado' || st === 'rejeitado') {
        statusColor = '#dc3545'; // Vermelho
        textColor = '#dc3545';   // Valor fica vermelho
    } 
    else if (st === 'aguarda_adm' || st === 'nao-liberado') {
        statusColor = '#f6ad55'; // Laranja
        statusText = 'Aguardando Validação';
    }

    if(statusContainer) {
        statusContainer.innerHTML = `<span class="status-badge-lg" style="background-color: ${statusColor}">${statusText}</span>`;
    }

    // --- VALORES E COR ---
    const valor = parseFloat(d.valor_total || d.VALOR_TOTAL || 0);
    const elValorTotal = document.getElementById('valor-total');
    elValorTotal.textContent = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    elValorTotal.style.color = textColor; // Aplica a cor (Verde/Vermelho)

    // --- KIT ---
    document.getElementById('kit-nome').textContent = d.kit_nome || 'Kit Personalizado';
    
    const pot = parseFloat(d.potencia_ideal || d.POTENCIA_IDEAL || 0);
    document.getElementById('kit-potencia').textContent = (pot > 0 ? pot.toFixed(2) : '0') + ' kWh';

    // --- ITENS (LISTA DE PRODUTOS) ---
    const listaProd = document.getElementById('lista-produtos');
    if (d.itens && d.itens.length > 0) {
        listaProd.innerHTML = d.itens.map(item => {
            // Tenta pegar minúsculo ou maiúsculo
            const qtd = item.quantidade || item.QUANTIDADE || 0;
            const nome = item.produto || item.nome || item.NOME || 'Item sem nome';
            const modelo = item.modelo || item.MODELO || '';
            const tipo = item.tipo_produto || item.TIPO_PRODUTO || '';

            return `
            <li class="item-li">
                <div class="item-info">
                    <div class="item-name">${qtd}x ${nome}</div>
                    <div class="item-meta">${modelo} (${tipo})</div>
                </div>
            </li>
            `;
        }).join('');
    } else {
        listaProd.innerHTML = '<li class="item-li">Nenhum item detalhado.</li>';
    }

    // --- IMÓVEL ---
    // Usando operadores || para garantir que pegue o dado mesmo se vier maiusculo/minusculo/alias
    document.getElementById('imo-nome').textContent = d.imovel_nome || d.identificador || '-';
    
    const rua = d.logradouro || d.LOGRADOURO || '';
    const num = d.numero || d.NUMERO || '';
    document.getElementById('imo-end').textContent = `${rua}, ${num}`;
    
    const bairro = d.nm_bairro || d.NM_BAIRRO || '';
    const cidade = d.nm_cidade || d.NM_CIDADE || '';
    const uf = d.sg_estado || d.SG_ESTADO || '';
    document.getElementById('imo-cidade').textContent = `${bairro} - ${cidade}/${uf}`;
    
    document.getElementById('imo-regiao').textContent = d.regiao || d.NOME || '-';
    document.getElementById('imo-consumo').textContent = d.consumo || d.CONSUMO || '0';

    // --- CLIENTE ---
    document.getElementById('cli-nome').textContent = d.cliente_nome || '-';
    document.getElementById('cli-email').textContent = d.cliente_email || '-';
    document.getElementById('cli-tel').textContent = d.cliente_telefone || '-';

    // --- FORNECEDOR ---
    document.getElementById('forn-nome').textContent = d.fornecedor_nome || 'Não atribuído';
    document.getElementById('forn-email').textContent = d.fornecedor_email || '-';
    document.getElementById('forn-tel').textContent = d.fornecedor_telefone || '-';
}