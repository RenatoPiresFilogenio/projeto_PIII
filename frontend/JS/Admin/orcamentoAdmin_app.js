
const API_URL = '../../../../backend/Admin/Orcamentos/aprovarOrcamentos.php';

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
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
                <div class="stat-number">${totalCount}</div>
                <div class="stat-label">Total de Orçamentos</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="color: #38a169;">${formatarMoeda(valorAprovado)}</div>
                <div class="stat-label">Valor Aprovado</div>
                <div class="stat-sublabel">${aprovadosCount} ${aprovadosCount === 1 ? 'proposta' : 'propostas'}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="color: #e53e3e;">${formatarMoeda(valorRecusado)}</div>
                <div class="stat-label">Valor Perdido (Recusado)</div>
                <div class="stat-sublabel">${recusadosCount} ${recusadosCount === 1 ? 'proposta' : 'propostas'}</div>
            </div>

            <div class="stat-card">
                <div class="stat-number" style="color: #d69e2e;">${naoLiberadosCount}</div>
                <div class="stat-label">Não Liberados</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number" style="font-size: 1.5rem;">${formatarMoeda(valorTotal)}</div>
                <div class="stat-label">Valor Total (Propostas)</div>
            </div>
        `;
    } catch (error) {
        console.error("Falha ao buscar estatísticas:", error);
         document.getElementById('estatisticasGerais').innerHTML = 
            '<div class="empty-state"><h3>Erro ao carregar estatísticas.</h3></div>';
    }
}

async function renderizarOrcamentos() {
    const filtroRegiao = document.getElementById('filtroRegiao').value;
    const filtroFornecedor = document.getElementById('filtroFornecedor').value;
    const buscaCliente = document.getElementById('buscaCliente').value;

    const params = new URLSearchParams({
        action: 'orcamentosAguardando',
        regiao: filtroRegiao,
        fornecedor: filtroFornecedor,
        cliente: buscaCliente
    });

    try {
        const response = await fetch(`${API_URL}?${params}`);
        if (!response.ok) throw new Error('Falha ao buscar orçamentos');
        const filtrados = await response.json();

        const container = document.getElementById('orcamentosAprovados');

        if (filtrados.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum orçamento encontrado</h3>
                    <p>Tente ajustar os filtros ou aguarde novas aprovações dos clientes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtrados.map(orcamento => {
            const status_pendente = true;

            return `
                <div class="orcamento-card">
                    <div class="status-badge" style="background: ${status_pendente ? '#a14d38ff' : '#38a169'};">
                        ${status_pendente ? 'PENDENTE' : '✅ APROVADO'}
                    </div>
                    
                    <div class="cliente-header">
                        <div class="cliente-nome">${orcamento.cliente}</div>
                        <div class="cliente-info">
                            📧 ${orcamento.email} | 📱 ${orcamento.telefone} | 📍 ${orcamento.regiao.toUpperCase()}
                        </div>
                    </div>

                    <div class="orcamento-details">
                        <div class="detail-item">
                            <div class="detail-label">Valor</div>
                            <div class="detail-value valor">${formatarMoeda(orcamento.valor)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Fornecedor</div>
                            <div class="detail-value">${orcamento.fornecedor}</div>
                        </div>
                    </div>

                    <div class="actions">
                        <button class="btn btn-detalhes" onclick="verDetalhes(${orcamento.id})">
                            📋 Ver Detalhes
                        </button>
                        <button class="btn btn-rejeitar" onclick="rejeitarOrcamento(${orcamento.id}, '${orcamento.cliente}')">
                            ❌ Rejeitar
                        </button>
                        <button class="btn btn-confirmar" onclick="confirmarOrcamento(${orcamento.id}, '${orcamento.cliente}')">
                            ✅ Confirmar Execução
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Erro em renderizarOrcamentos:", error);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar dados.</h3></div>`;
    }
}

async function popularFiltros() {
    try {
        const response = await fetch(`${API_URL}?action=getFornecedores`);
        if (!response.ok) throw new Error('Falha ao buscar fornecedores');
        const fornecedores = await response.json();

        const select = document.getElementById('filtroFornecedor');
        fornecedores.forEach(nome => {
            const option = document.createElement('option');
            option.value = nome;
            option.textContent = nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao popular filtros:", error);
    }
}


function confirmarOrcamento(id, cliente) {
    document.getElementById('modalTitle').textContent = `Confirmar - ${cliente}`;
    document.getElementById('modalObservacoes').style.display = 'block';

    document.getElementById('btnConfirmarModal').onclick = async function () {
        const observacoes = document.getElementById('observacoes').value;

        const sucesso = await atualizarStatus(id, 'confirmado', observacoes);

        if (sucesso) {
            alert(` Orçamento de ${cliente} confirmado com sucesso!`);
            fecharModal();
            renderizarEstatisticasGerais();
            renderizarOrcamentos();
        } else {
            alert(" Erro ao confirmar o orçamento. Tente novamente.");
        }
    };
}

async function rejeitarOrcamento(id, cliente) {
    const motivo = prompt(`Motivo da rejeição do orçamento de ${cliente}:`);

    if (motivo !== null && motivo.trim() !== "") {
        const sucesso = await atualizarStatus(id, 'rejeitado', motivo);

        if (sucesso) {
            alert(` Orçamento de ${cliente} rejeitado.`);

            renderizarEstatisticasGerais();
            renderizarOrcamentos();
        } else {
            alert(" Erro ao rejeitar o orçamento. Tente novamente.");
        }
    } else if (motivo !== null) {
        alert("É necessário informar um motivo para a rejeição.");
    }
}


async function atualizarStatus(id, novoStatus, observacoes) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'atualizarStatus',
                id: id,
                status: novoStatus,
                observacoes: observacoes
            })
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
            console.error("Falha na API:", result.error || 'Erro desconhecido');
            return false;
        }

        return result.success;

    } catch (error) {
        console.error("Erro de rede em atualizarStatus:", error);
        return false;
    }
}


async function verDetalhes(id) {
    try {
        const response = await fetch(`${API_URL}?action=orcamentoDetalhes&id=${id}`);
        if (!response.ok) throw new Error('Falha ao buscar detalhes');
        const orcamento = await response.json();

        if (orcamento.error) {
            alert(orcamento.error);
            return;
        }

        const itensFormatados = orcamento.itens.split(', ').map(item => `• ${item}`).join('\n');

        const detalhes = `
DETALHES COMPLETOS DO ORÇAMENTO (ID: ${orcamento.id})

Cliente: ${orcamento.cliente}
Email: ${orcamento.email}
Telefone: ${orcamento.telefone}
Região: ${orcamento.regiao.toUpperCase()}

Fornecedor: ${orcamento.fornecedor}
Valor: ${formatarMoeda(orcamento.valor)}

Itens Inclusos:
${itensFormatados}
        `;

        alert(detalhes);

    } catch (error) {
        console.error("Erro em verDetalhes:", error);
        alert("Erro ao carregar os detalhes.");
    }
}

function fecharModal() {
    document.getElementById('modalObservacoes').style.display = 'none';
    document.getElementById('observacoes').value = '';
    document.getElementById('btnConfirmarModal').onclick = null;
}


document.getElementById('filtroRegiao').addEventListener('change', renderizarOrcamentos);
document.getElementById('filtroFornecedor').addEventListener('change', renderizarOrcamentos);
document.getElementById('buscaCliente').addEventListener('input', renderizarOrcamentos);

document.getElementById('modalObservacoes').addEventListener('click', function (e) {
    if (e.target === this) {
        fecharModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    popularFiltros();
    renderizarEstatisticasGerais();
    renderizarOrcamentos();
});