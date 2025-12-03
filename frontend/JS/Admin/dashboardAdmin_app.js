const API_URL = '/projeto_PIII/backend/Admin/Orcamentos/acoesOrcamentos.php';

// Variável de controle da página (Global)
let paginaAtual = 1;

// --- FUNÇÕES AUXILIARES ---

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    if (!data) return '-';
    const partes = data.split('-');
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // DD/MM/YYYY
}

// --- LISTENERS DE FILTROS ---
document.getElementById('filtroStatus').addEventListener('change', () => {
    paginaAtual = 1;
    renderizarOrcamentosEscolhidos();
});

document.getElementById('filtroRegiao').addEventListener('change', () => {
    paginaAtual = 1;
    renderizarOrcamentosEscolhidos();
});


// --- FUNÇÃO PRINCIPAL: Renderizar Lista de Orçamentos ---

async function renderizarOrcamentosEscolhidos() {
    const filtroStatus = document.getElementById('filtroStatus').value;
    const filtroRegiao = document.getElementById('filtroRegiao').value;

    const params = new URLSearchParams({
        action: 'orcamentosEscolhidos',
        status: filtroStatus,
        regiao: filtroRegiao,
        page: paginaAtual
    });

    try {
        const response = await fetch(`${API_URL}?${params}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const respostaJson = await response.json();

        const listaOrcamentos = Array.isArray(respostaJson) ? respostaJson : respostaJson.data;
        const dadosPaginacao = respostaJson.paginacao || null;

        const container = document.getElementById('orcamentosEscolhidos');
        const containerPaginacao = document.getElementById('paginacaoContainer');

        if (!listaOrcamentos || listaOrcamentos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum orçamento encontrado</h3>
                    <p>Tente ajustar os filtros acima</p>
                </div>`;
            if (containerPaginacao) containerPaginacao.innerHTML = '';
            return;
        }

        container.innerHTML = listaOrcamentos.map(orcamento => {
            let borderClass = '';
            let badgeStyle = '';
            let statusLabel = '';
            const statusLower = orcamento.status ? orcamento.status.toLowerCase() : 'pendente';

            switch (statusLower) {
                case 'aprovado':
                case 'confirmado':
                    borderClass = 'status-border-approved';
                    badgeStyle = 'background: #c6f6d5; color: #22543d;';
                    statusLabel = 'Aprovado';
                    break;
                case 'recusado':
                    borderClass = 'status-border-denied';
                    badgeStyle = 'background: #fed7d7; color: #822727;';
                    statusLabel = 'Recusado (Cliente)';
                    break;
                case 'rejeitado':
                    borderClass = 'status-border-rejeitado';
                    badgeStyle = 'background: #fc8181; color: #fff;';
                    statusLabel = 'Rejeitado (Admin)';
                    break;
                case 'nao-liberado':
                case 'nao_liberado':
                case 'aguarda_adm':
                    borderClass = 'status-border-pending';
                    badgeStyle = 'background: #feebc8; color: #744210;';
                    statusLabel = 'Não Liberado'; // Unificado visualmente
                    break;
                default:
                    borderClass = 'status-border-pending';
                    badgeStyle = 'background: #edf2f7; color: #4a5568;';
                    statusLabel = orcamento.status || 'Pendente';
            }

            // Cálculos de Potência e Painéis
            const potenciaWatts = parseFloat(orcamento.potencia_real || 0);
            const potenciaKw = potenciaWatts / 1000;
            const potenciaTexto = potenciaKw > 0 ? potenciaKw.toFixed(2) + ' kWp' : 'N/D';

            const qtdPaineis = orcamento.qtd_paineis_reais || 0;
            const paineisTexto = `${qtdPaineis}x Painéis`;
            const regiaoFormatada = orcamento.regiao ? orcamento.regiao.toUpperCase() : 'N/D';

            return `
            <div class="orcamento-card-moderno ${borderClass}" onclick="verOrcamento(${orcamento.id})">
                <div class="card-info-main">
                    <div class="client-header">
                        <span class="client-name">${orcamento.cliente}</span>
                    </div>
                    <div class="tech-specs">
                        <div class="spec-item" title="Potência Real">
                            <i class="fas fa-bolt"></i>
                            <span>${potenciaTexto}</span>
                        </div>
                        <div class="spec-item" title="Quantidade Real de Painéis">
                            <i class="fas fa-solar-panel"></i>
                            <span>${paineisTexto}</span>
                        </div>
                        <div class="spec-item" title="Região">
                            <i class="fas fa-map-marker-alt" style="color: #e53e3e;"></i>
                            <span>${regiaoFormatada}</span>
                        </div>
                    </div>
                    <div class="fornecedor-info">
                        Fornecedor: <strong>${orcamento.fornecedor}</strong>
                    </div>
                </div>
                <div class="card-financial">
                    <div class="price-tag">${formatarMoeda(orcamento.valor)}</div>
                    <span class="status-badge-mini" style="${badgeStyle}">
                        ${statusLabel}
                    </span>
                    <div class="date-tag">
                        <i class="far fa-calendar-alt"></i> ${formatarData(orcamento.data)}
                    </div>
                </div>
            </div>`;
        }).join('');

        if (dadosPaginacao && containerPaginacao) {
            renderizarBotoesPaginacao(dadosPaginacao);
        }

    } catch (error) {
        console.error("Falha detalhada ao buscar orçamentos:", error);
        document.getElementById('orcamentosEscolhidos').innerHTML =
            `<div class="empty-state">
                <h3>Erro ao carregar dados</h3>
                <p>Verifique o console (F12) para detalhes do erro.</p>
             </div>`;
    }
}


// --- PAGINAÇÃO ---

function renderizarBotoesPaginacao(info) {
    const container = document.getElementById('paginacaoContainer');
    const totalPaginas = parseInt(info.total_paginas);
    const pgAtual = parseInt(info.pagina_atual);

    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button class="pagination-btn" onclick="mudarPagina(${pgAtual - 1})" ${pgAtual === 1 ? 'disabled' : ''}>&laquo;</button>`;

    let startPage = Math.max(1, pgAtual - 2);
    let endPage = Math.min(totalPaginas, pgAtual + 2);

    if (endPage - startPage < 4) {
        if (startPage === 1) endPage = Math.min(totalPaginas, startPage + 4);
        else if (endPage === totalPaginas) startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === pgAtual ? 'active' : '';
        html += `<button class="pagination-btn ${activeClass}" onclick="mudarPagina(${i})">${i}</button>`;
    }

    html += `<button class="pagination-btn" onclick="mudarPagina(${pgAtual + 1})" ${pgAtual >= totalPaginas ? 'disabled' : ''}>&raquo;</button>`;
    container.innerHTML = html;
}

window.mudarPagina = function (novaPagina) {
    paginaAtual = novaPagina;
    renderizarOrcamentosEscolhidos();
}

window.verOrcamento = function (id) {
    window.location.href = `ver-orcamento.html?id=${id}`;
}


// --- OUTRAS FUNÇÕES DO DASHBOARD (Resumo, Rankings) ---

async function renderizarEstatisticasGerais() {
    try {
        const response = await fetch(`${API_URL}?action=estatisticasGerais`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();

        // Valores Individuais
        const totalCount = Number(stats.total) || 0;
        const aprovadosCount = Number(stats.aprovados) || 0;
        const recusadosCount = Number(stats.recusados) || 0;

        // Valores Monetários
        const valorAprovado = Number(stats.valorAprovado || stats.valoraprovado) || 0;
        const valorRecusado = Number(stats.valorRecusado || stats.valorrecusado) || 0;

        // TRUQUE AQUI: Calculamos o total SOMANDO apenas Aprovado + Recusado
        // Assim ignoramos qualquer valor pendente que venha do banco
        const valorTotalReal = valorAprovado + valorRecusado;

        const container = document.getElementById('estatisticasGerais');

        // Removemos o card de "Não Liberados" do HTML abaixo
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-number" id="stat-total">0</div>
                <div class="stat-label">Total de Orçamentos</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="color: #38a169;" id="stat-valor-aprovado">${formatarMoeda(0)}</div>
                <div class="stat-label">Valor Aprovado</div>
                <div class="stat-sublabel" id="stat-count-aprovado">0 propostas</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="color: #e53e3e;" id="stat-valor-recusado">${formatarMoeda(0)}</div>
                <div class="stat-label">Valor Perdido (Recusado)</div>
                <div class="stat-sublabel" id="stat-count-recusado">0 propostas</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="font-size: 1.5rem;" id="stat-valor-total">${formatarMoeda(0)}</div>
                <div class="stat-label">Valor Total (Processado)</div>
            </div>
        `;

        const duration = 1000;
        animateCountUp(document.getElementById('stat-total'), totalCount, duration, false);
        animateCountUp(document.getElementById('stat-valor-aprovado'), valorAprovado, duration, true);
        animateCountUp(document.getElementById('stat-valor-recusado'), valorRecusado, duration, true);
        // Usamos o valor calculado aqui, não o que veio do banco
        animateCountUp(document.getElementById('stat-valor-total'), valorTotalReal, duration, true);

        // Sub-labels
        const aprovLabel = document.getElementById('stat-count-aprovado');
        aprovLabel.innerHTML = `${aprovadosCount} ${aprovadosCount === 1 ? 'proposta' : 'propostas'}`;

        const recusLabel = document.getElementById('stat-count-recusado');
        recusLabel.innerHTML = `${recusadosCount} ${recusadosCount === 1 ? 'proposta' : 'propostas'}`;

    } catch (error) {
        console.error("Falha ao buscar estatísticas:", error);
    }
}

// --- ANIMAÇÃO NÚMEROS ---
function animateCountUp(element, endValue, duration, isCurrency) {
    if (!element) return;
    let startTime = null;
    const startValue = 0;

    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        let currentValue = Math.floor(progress * (endValue - startValue) + startValue);

        element.innerHTML = isCurrency ? formatarMoeda(currentValue) : currentValue;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.innerHTML = isCurrency ? formatarMoeda(endValue) : endValue;
        }
    };
    window.requestAnimationFrame(step);
}

// --- FUNÇÕES DE RANKING ---
async function calcularRegiaoMaiorAprovacao() {
    try {
        const response = await fetch(`${API_URL}?action=regiaoMaiorAprovacao`);
        if (!response.ok) return;
        const ranking = await response.json();
        const container = document.getElementById('regiaoMaiorAprovacao');
        if (!container) return;
        container.innerHTML = ranking.map((item, index) => `
            <div class="insight-item">
                <div class="insight-title">#${index + 1} ${item.regiao.toUpperCase()}</div>
                <div class="insight-value">${(item.taxa * 100).toFixed(1)}%</div>
                <div class="insight-desc">${item.aprovados} aprovados de ${item.total} orçamentos</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function calcularFornecedoresTop() {
    try {
        const response = await fetch(`${API_URL}?action=fornecedoresTop`);
        if (!response.ok) return;
        const ranking = await response.json();
        const container = document.getElementById('fornecedoresTop');
        if (!container) return;
        container.innerHTML = ranking.map((fornecedor, index) => `
            <div class="insight-item">
                <div class="insight-title">#${index + 1} - ${fornecedor.regiao.toUpperCase()}</div>
                <div class="insight-value">${fornecedor.fornecedor}</div>
                <div class="insight-desc">${(fornecedor.taxa * 100).toFixed(1)}% aprovação</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function renderFornecedoresPorRegiao() {
    try {
        const response = await fetch(`${API_URL}?action=fornecedoresPorRegiao`);
        if (!response.ok) return;
        const ranking = await response.json();
        const container = document.getElementById('fornecedoresPorRegiaoCount');
        if (!container) return;
        if (ranking.length === 0) {
            container.innerHTML = '<div class="insight-item-empty">Sem dados.</div>';
            return;
        }
        container.innerHTML = ranking.map(item => `
            <div class="insight-item">
                <div class="insight-title">${item.regiao.toUpperCase()}</div>
                <div class="insight-value">${item.contagem}</div>
                <div class="insight-desc">fornecedores</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    renderizarOrcamentosEscolhidos();
    renderizarEstatisticasGerais();
    calcularRegiaoMaiorAprovacao();
    calcularFornecedoresTop();
    renderFornecedoresPorRegiao();
});