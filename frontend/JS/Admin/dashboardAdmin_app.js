
const API_URL = '/projeto_PIII/backend/Admin/Orcamentos/acoesOrcamentos.php';
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

async function renderizarOrcamentosEscolhidos() {
    const filtroStatus = document.getElementById('filtroStatus').value;
    const filtroRegiao = document.getElementById('filtroRegiao').value;

    const params = new URLSearchParams({
        action: 'orcamentosEscolhidos',
        status: filtroStatus,
        regiao: filtroRegiao
    });

    try {
        const response = await fetch(`${API_URL}?${params}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const filtrados = await response.json();

        const container = document.getElementById('orcamentosEscolhidos');

        if (filtrados.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Nenhum orçamento encontrado</h3><p>Tente ajustar os filtros acima</p></div>';
            return;
        }

        container.innerHTML = filtrados.map(orcamento => {
            
            // --- NOVA LÓGICA DE STATUS ---
            let statusClass = '';
            let statusTexto = '';

            switch (orcamento.status) {
                case 'aprovado':
                case 'confirmado':
                    statusClass = 'approved';
                    statusTexto = 'Aprovado';
                    break;
                case 'recusado':
                    statusClass = 'denied';
                    statusTexto = 'Recusado (Cliente)';
                    break;
                case 'rejeitado':
                    statusClass = 'rejeitado'; // Classe CSS para vermelho forte
                    statusTexto = 'Rejeitado (Admin)';
                    break;
                case 'nao-liberado':
                    statusClass = 'pending';
                    statusTexto = 'Não Liberado';
                    break;
                case 'AGUARDA_ADM':
                    statusClass = 'pending';
                    statusTexto = 'Aguardando Admin';
                    break;
                default:
                    statusClass = 'other';
                    statusTexto = orcamento.status;
            }
            // --- FIM DA LÓGICA ---

            return `
            <div class="orcamento-item" onclick="verOrcamento(${orcamento.id})">
                <div class="orcamento-header">
                    <div class="cliente-nome">${orcamento.cliente}</div>
                    <div class="orcamento-valor">${formatarMoeda(orcamento.valor)}</div>
                </div>
                <div class="orcamento-info">
                    <span>${orcamento.fornecedor} • ${orcamento.regiao.toUpperCase()}</span>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        
                        <span class="status ${statusClass}">
                            ${statusTexto}
                        </span>
                        
                        <span>${formatarData(orcamento.data)}</span>
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Falha ao buscar orçamentos:", error);
        document.getElementById('orcamentosEscolhidos').innerHTML =
            '<div class="empty-state"><h3>Erro ao carregar dados</h3><p>Não foi possível conectar ao servidor.</p></div>';
    }
}

async function renderizarEstatisticasGerais() {
    try {
        const response = await fetch(`${API_URL}?action=estatisticasGerais`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();

        const totalCount = Number(stats.total) || 0;
        const aprovadosCount = Number(stats.aprovados) || 0;
        const recusadosCount = Number(stats.recusados) || 0;
        const naoLiberadosCount = Number(stats.naoliberados) || 0;
        const valorTotal = Number(stats.valortotal) || 0;
        const valorAprovado = Number(stats.valoraprovado) || 0;
        const valorRecusado = Number(stats.valorrecusado) || 0;

        const container = document.getElementById('estatisticasGerais');
        
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
                <div class="stat-number" style="color: #d69e2e;" id="stat-nao-liberados">0</div>
                <div class="stat-label">Não Liberados</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="font-size: 1.5rem;" id="stat-valor-total">${formatarMoeda(0)}</div>
                <div class="stat-label">Valor Total (Propostas)</div>
            </div>
        `;

        const duration = 1500; 
        
        animateCountUp(document.getElementById('stat-total'), totalCount, duration, false);
        animateCountUp(document.getElementById('stat-valor-aprovado'), valorAprovado, duration, true);
        animateCountUp(document.getElementById('stat-valor-recusado'), valorRecusado, duration, true);
        animateCountUp(document.getElementById('stat-nao-liberados'), naoLiberadosCount, duration, false);
        animateCountUp(document.getElementById('stat-valor-total'), valorTotal, duration, true);

        const aprovLabel = document.getElementById('stat-count-aprovado');
        animateCountUp(aprovLabel, aprovadosCount, duration, false);
        aprovLabel.innerHTML += ` ${aprovadosCount === 1 ? 'proposta' : 'propostas'}`; 
        
        const recusLabel = document.getElementById('stat-count-recusado');
        animateCountUp(recusLabel, recusadosCount, duration, false);
        recusLabel.innerHTML += ` ${recusadosCount === 1 ? 'proposta' : 'propostas'}`; 

    } catch (error) {
        console.error("Falha ao buscar estatísticas:", error);
         document.getElementById('estatisticasGerais').innerHTML = 
            '<div class="empty-state"><h3>Erro ao carregar estatísticas.</h3></div>';
    }
}


async function renderizarClientesPorRegiao() {
    try {
        const response = await fetch(`${API_URL}?action=clientesPorRegiao`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const clientesPorRegiao = await response.json();

        const container = document.getElementById('clientesPorRegiao');

        container.innerHTML = Object.keys(clientesPorRegiao).map(regiao => `
            <div class="regiao-block">
                <div class="regiao-title">${regiao}</div>
                ${Object.keys(clientesPorRegiao[regiao]).map(cliente => {
            const stats = clientesPorRegiao[regiao][cliente];
            return `
                        <div class="cliente-item">
                            <div class="cliente-header">${cliente}</div>
                            <div class="cliente-stats">
                                <span class="stat-badge aprovados">${stats.aprovados} Aprovados</span>
                                <span class="stat-badge recusados">${stats.recusados} Recusados</span>
                                <span class="stat-badge nao-liberados">${stats.naoLiberados} Pendentes</span>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `).join('');
    } catch (error) {
        console.error("Falha ao buscar clientes por região:", error);
    }
}

async function calcularRegiaoMaiorAprovacao() {
    try {
        const response = await fetch(`${API_URL}?action=regiaoMaiorAprovacao`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const ranking = await response.json();

        const container = document.getElementById('regiaoMaiorAprovacao');

        container.innerHTML = ranking.map((item, index) => `
            <div class="insight-item">
                <div class="insight-title">#${index + 1} ${item.regiao.toUpperCase()}</div>
                <div class="insight-value">${(item.taxa * 100).toFixed(1)}%</div>
                <div class="insight-desc">${item.aprovados} aprovados de ${item.total} orçamentos</div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Falha ao buscar ranking de regiões:", error);
    }
}


async function calcularFornecedoresTop() {
    try {
        const response = await fetch(`${API_URL}?action=fornecedoresTop`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const ranking = await response.json();

        const container = document.getElementById('fornecedoresTop');

        container.innerHTML = ranking.map((fornecedor, index) => `
            <div class="insight-item">
                <div class="insight-title">#${index + 1} - ${fornecedor.regiao.toUpperCase()}</div>
                <div class="insight-value">${fornecedor.fornecedor}</div>
                <div class="insight-desc">${(fornecedor.taxa * 100).toFixed(1)}% aprovação (${fornecedor.aprovados}/${fornecedor.total})</div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Falha ao buscar top fornecedores:", error);
    }
}

function verOrcamento(id) {
    window.location.href = `ver-orcamento.html?id=${id}`;
}

async function renderFornecedoresPorRegiao() {
    try {
        const response = await fetch(`${API_URL}?action=fornecedoresPorRegiao`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const ranking = await response.json();

        const container = document.getElementById('fornecedoresPorRegiaoCount');

        if (ranking.length === 0) {
            container.innerHTML = '<div class="insight-item-empty">Sem dados de fornecedores.</div>';
            return;
        }

        container.innerHTML = ranking.map(item => `
            <div class="insight-item">
                <div class="insight-title">${item.regiao.toUpperCase()}</div>
                <div class="insight-value">${item.contagem}</div>
                <div class="insight-desc">${item.contagem === 1 ? 'fornecedor' : 'fornecedores'}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Falha ao buscar contagem de fornecedores por região:", error);
        document.getElementById('fornecedoresPorRegiaoCount').innerHTML =
            '<div class="insight-item-empty" style="color: #e53e3e;">Erro ao carregar dados.</div>';
    }
}


document.getElementById('filtroStatus').addEventListener('change', renderizarOrcamentosEscolhidos);
document.getElementById('filtroRegiao').addEventListener('change', renderizarOrcamentosEscolhidos);

/**
 * 
 * * @param {HTMLElement} element 
 * @param {number} endValue 
 * @param {number} duration 
 * @param {boolean} isCurrency 
 */
function animateCountUp(element, endValue, duration, isCurrency) {
    let startTime = null;
    const startValue = 0;

    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        let currentValue = Math.floor(progress * (endValue - startValue) + startValue);

        if (isCurrency) {
            element.innerHTML = formatarMoeda(currentValue);
        } else {
            element.innerHTML = currentValue;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            if (isCurrency) {
                element.innerHTML = formatarMoeda(endValue);
            } else {
                element.innerHTML = endValue;
            }
        }
    };

    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarOrcamentosEscolhidos();
    renderizarEstatisticasGerais();
    renderizarClientesPorRegiao();
    calcularRegiaoMaiorAprovacao();
    calcularFornecedoresTop();
    renderFornecedoresPorRegiao();
});