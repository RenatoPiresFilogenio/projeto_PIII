// ===========================================
// JS - PÁGINA ORÇAMENTOS (Lógica do Wizard)
// ===========================================

// --- Estado Global ---
let appState = {
    properties: [],
    selectedProperty: null,
    budgets: [],
    approvedBudget: null,
    currentStep: 1,
    paginaAtual: 1
};

// --- Elementos do DOM ---
const DOM = {
    toast: document.getElementById('toast'),
    modal: {
        overlay: document.getElementById('modal-overlay'),
        title: document.getElementById('modal-title'),
        body: document.getElementById('modal-body-content'),
        actions: document.getElementById('modal-footer-actions'),
        closeBtn: document.getElementById('modal-close')
    },
    steps: {
        indicators: document.querySelectorAll('.step'),
        contents: document.querySelectorAll('.step-content')
    },
    step1: {
        selector: document.getElementById('properties-selector'),
        pagination: document.getElementById('paginacaoContainer'), // Onde os botões vão aparecer
        emptyState: document.getElementById('empty-properties'),
        warning: document.getElementById('low-consumption-warning'),
        consumptionValue: document.getElementById('consumption-value')
    },
    step2: {
        header: document.querySelector('#step-2 .section-header'),
        grid: document.getElementById('budgets-grid'),
        infoBanner: document.getElementById('selected-property-info')
    },
    step3: {
        infoBox: document.getElementById('approved-budget-info')
    }
};

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeWizard();
});

function setupEventListeners() {
    const navImoveis = document.getElementById('nav-imoveis');
    if (navImoveis) {
        navImoveis.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'CadastrarImoveis.php';
        });
    }

    if (DOM.modal.closeBtn) DOM.modal.closeBtn.addEventListener('click', hideModal);
    if (DOM.modal.overlay) {
        DOM.modal.overlay.addEventListener('click', (e) => {
            if (e.target === DOM.modal.overlay) hideModal();
        });
    }

    if (DOM.modal.actions) {
        DOM.modal.actions.addEventListener('click', (e) => {
            if (e.target.id === 'modal-cancel') hideModal();
        });
    }
}

function initializeWizard() {
    renderPropertiesSelector();
    goToStep(1);
}

// --- ETAPA 1: SELETOR DE IMÓVEIS ---
function showEmptyPropertiesState() {
    if (DOM.step1.selector) DOM.step1.selector.style.display = 'none';
    if (DOM.step1.pagination) DOM.step1.pagination.innerHTML = '';
    if (DOM.step1.emptyState) DOM.step1.emptyState.style.display = 'block';
}

// --- RENDERIZAÇÃO DE IMÓVEIS ---
async function renderPropertiesSelector() {
    // Se não achar o elemento, para tudo para não dar erro
    if (!DOM.step1.selector) return;

    // Loading
    DOM.step1.selector.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#aaa;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Carregando...</div>';
    if (DOM.step1.pagination) DOM.step1.pagination.innerHTML = ''; // Limpa botões

    try {
        // Chama o PHP passando a página atual
        const response = await fetch(`../../../backend/ClienteBackEnd/listaimoveis.php?page=${appState.paginaAtual}`);
        const responseJson = await response.json();

        // Verifica se veio no formato novo com paginação
        if (responseJson.data && Array.isArray(responseJson.data)) {
            appState.properties = responseJson.data;

            // AQUI: Chama a renderização dos botões se houver dados de paginação
            if (responseJson.paginacao) {
                renderPagination(responseJson.paginacao);
            }
        } else if (Array.isArray(responseJson)) {
            // Fallback para formato antigo
            appState.properties = responseJson;
        } else {
            appState.properties = [];
        }

        // Se vazio
        if (appState.properties.length === 0) {
            showEmptyPropertiesState();
            return;
        }

        // Exibe
        DOM.step1.selector.style.display = 'grid';
        if (DOM.step1.emptyState) DOM.step1.emptyState.style.display = 'none';

        DOM.step1.selector.innerHTML = appState.properties.map(prop => `
            <div class="property-option" id="prop-${prop.id}" onclick="selectProperty('${prop.id}')">
                <div class="prop-icon-bg"><i class="fas fa-home"></i></div>
                <div class="property-content">
                    <div class="prop-name">${prop.nome || 'Sem Nome'}</div>
                    <div class="property-address">
                        ${prop.rua || ''}, ${prop.numero || ''} <br>
                        ${prop.bairro || ''} - ${prop.cidade || ''}/${prop.estado || ''}
                    </div>
                    <div class="property-badges">
                        <span class="prop-badge"><i class="fas fa-map-marker-alt"></i> ${prop.regiao || 'N/D'}</span>
                        <span style="font-weight:700; color:#2d3748; margin-left:10px;">
                            <i class="fas fa-bolt" style="color:#f6ad55;"></i> ${prop.consumo || 0} kWh
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        DOM.step1.selector.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar imóveis.</p>';
    }
}

// --- FUNÇÃO DE PAGINAÇÃO (DEBUG + CORREÇÃO DE TIPO) ---
function renderPagination(info) {
    if (!DOM.step1.pagination) return;

    // Garante numéricos
    const pgAtual = parseInt(info.pagina_atual);
    const totalPaginas = parseInt(info.total_paginas);

    if (totalPaginas <= 1) {
        DOM.step1.pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Anterior
    html += `<button class="pagination-btn" onclick="mudarPagina(${pgAtual - 1})" ${pgAtual === 1 ? 'disabled' : ''}>&laquo;</button>`;

    // Números
    for (let i = 1; i <= totalPaginas; i++) {
        // Aqui a mágica acontece
        const activeClass = (i === pgAtual) ? 'active' : '';
        html += `<button class="pagination-btn ${activeClass}" onclick="mudarPagina(${i})">${i}</button>`;
    }

    // Próximo
    html += `<button class="pagination-btn" onclick="mudarPagina(${pgAtual + 1})" ${pgAtual >= totalPaginas ? 'disabled' : ''}>&raquo;</button>`;

    DOM.step1.pagination.innerHTML = html;
}
// Ação de clicar na página
window.mudarPagina = function (novaPagina) {
    appState.paginaAtual = novaPagina;
    renderPropertiesSelector(); // Recarrega a lista com a nova página
}

function selectProperty(propId) {
    appState.selectedProperty = appState.properties.find(p => String(p.id) === String(propId));
    if (!appState.selectedProperty) return;

    document.querySelectorAll('.property-option').forEach(el => el.classList.remove('selected'));
    const card = document.getElementById(`prop-${propId}`);
    if (card) card.classList.add('selected');

    showToast(`Imóvel "${appState.selectedProperty.nome}" selecionado`, 'success');

    proceedToBudgets();
}

function backToPropertySelection() {
    if (DOM.step1.warning) DOM.step1.warning.style.display = 'none';
    appState.selectedProperty = null;
    document.querySelectorAll('.property-option').forEach(el => el.classList.remove('selected'));
}

function proceedWithLowConsumption() {
    if (DOM.step1.warning) DOM.step1.warning.style.display = 'none';
    proceedToBudgets();
}

// --- ETAPA 2: ORÇAMENTOS ---
async function proceedToBudgets() {
    showToast('Buscando propostas...', 'success');
    goToStep(2);

    if (DOM.step2.header) DOM.step2.header.style.display = 'none';
    if (DOM.step2.infoBanner) DOM.step2.infoBanner.innerHTML = '';

    if (DOM.step2.grid) {
        DOM.step2.grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 50px; text-align: center; color: var(--cinza-claro);">
                <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--azul-primario);"></i>
                <p style="margin-top: 15px; font-weight: 600;">Calculando ofertas...</p>
            </div>`;
    }

    try {
        const response = await fetch(`../../../backend/ClienteBackEnd/orcamentos/buscar_orcamentos.php?id_imovel=${appState.selectedProperty.id}`);
        const data = await response.json();

        appState.budgets = Array.isArray(data) ? data : [];

        if (appState.budgets.length === 0) {
            if (DOM.step2.header) DOM.step2.header.style.display = 'none';
            DOM.step2.grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-search fa-3x" style="color: #cbd5e0; margin-bottom: 20px;"></i>
                    <h4>Nenhuma proposta encontrada.</h4>
                    <p style="color: #718096;">Não encontramos kits compatíveis no momento.</p>
                </div>`;
        } else {
            if (DOM.step2.header) DOM.step2.header.style.display = 'block';
            renderBudgets();
        }

        if (DOM.step2.infoBanner) {
            DOM.step2.infoBanner.innerHTML = `
            <div class="selected-property-icon">
                <i class="fas fa-home"></i>
            </div>
            <div class="selected-property-details">
                <h4>${appState.selectedProperty.nome}</h4>
                <span>
                    ${appState.selectedProperty.cidade}/${appState.selectedProperty.estado} • 
                    <strong>${appState.selectedProperty.consumo} kWh</strong>
                </span>
            </div>
        `;
        }

    } catch (error) {
        console.error(error);
        showToast('Erro ao buscar orçamentos', 'error');
        goToStep(1);
    }
}

function renderBudgets() {
    DOM.step2.grid.innerHTML = appState.budgets.map((budget, index) => {
        const isBestValue = index === 0;
        const cardClass = isBestValue ? 'budget-card best-value' : 'budget-card';
        const banner = isBestValue ? '<div class="best-value-banner"><i class="fas fa-star"></i> Melhor Escolha</div>' : '';

        const total = formatCurrency(budget.totalPrice);
        const installment = formatCurrency(budget.monthlyInstallment);
        const savings = formatCurrency(budget.estimatedSavings);

        let panelQty = budget.panelQuantity;
        if (!panelQty) {
            const pot = parseFloat(budget.systemPower);
            const watts = pot > 100 ? pot : pot * 1000;
            panelQty = Math.ceil(watts / 550);
        }
        budget.panelQuantity = panelQty;

        return `
            <div class="${cardClass}">
                ${banner}
                <div class="budget-header">
                    <div class="supplier-name">${budget.name}</div>
                    <div class="supplier-rating">
                        ${generateStarRating(budget.rating)}
                    </div>
                </div>
                <div class="budget-body">
                    <div class="price-box">
                        <div class="price-value">${total}</div>
                        <div class="price-installments">ou 60x de ${installment}</div>
                    </div>
                    <ul class="specs-list">
                        <li><span>Potência</span> <strong>${budget.systemPower} kHw</strong></li>
                        <li><span>Painéis</span> <strong>${panelQty} unidades</strong></li>
                        <li><span>Economia</span> <strong class="highlight">${savings}</strong></li>
                    </ul>
                    <div class="products-box">
                        <h5><i class="fas fa-box-open"></i> Itens Inclusos</h5>
                        <div class="product-item">${budget.products}</div>
                    </div>
                    <div class="budget-actions">
                        <button class="btn btn-reject" onclick="handleReject(${budget.id})">Recusar</button>
                        <button class="btn btn-approve" onclick="confirmApproval(${budget.id})">Aprovar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function confirmApproval(budgetId) {
    const budget = appState.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    // ⇩⇩ 1. TÍTULO DO MODAL
    DOM.modal.title.innerHTML = `
        <i class="fas fa-check-circle" style="color:var(--verde-sucesso)"></i>
        Confirmar Aprovação
    `;

    // ⇩⇩ 2. CONTEÚDO DO MODAL (BODY)
    DOM.modal.body.innerHTML = `
        <p style="font-size: 1.1rem; margin-bottom: 20px; text-align: center;">
            Você está aprovando a proposta da <strong>${budget.name}</strong>.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <span style="color:var(--cinza-texto);">Valor Final:</span>
                <strong style="font-size:1.2rem; color:var(--azul-primario);">
                    ${formatCurrency(budget.totalPrice)}
                </strong>
            </div>

            <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--cinza-texto);">Sistema:</span>
                <strong>${budget.systemPower} kWh (${budget.panelQuantity} painéis)</strong>
            </div>
        </div>

        <p style="margin-top: 20px; font-size: 0.9rem; color: var(--cinza-claro); text-align: center;">
            Ao confirmar, o orçamento será registrado como <strong>Aprovado</strong>.
        </p>
    `;

    // ⇩⇩ 3. BOTÕES DO RODAPÉ (RECONSTRUÍDOS)
    DOM.modal.actions.innerHTML = `
        <button id="modal-cancel" class="btn btn-secondary">Cancelar</button>
        <button id="modal-confirm" class="btn btn-success">
            Confirmar Aprovação <i class="fas fa-arrow-right"></i>
        </button>
    `;

    // ⇩⇩ 4. SALVA O BOTÃO CONFIRMAR (IMPORTANTE!)
    DOM.modal.confirmBtn = document.getElementById('modal-confirm');

    // ⇩⇩ 5. EVENTOS DOS BOTÕES
    document.getElementById('modal-cancel').onclick = hideModal;
    DOM.modal.confirmBtn.onclick = () => submitApproval(budget);

    // ⇩⇩ 6. ABRE O MODAL
    showModal();
}
document.getElementById("modal-confirm").onclick = () => submitApproval(budget);


async function submitApproval(budget) {
    // Evita duplo clique
    DOM.modal.confirmBtn.disabled = true;
    DOM.modal.confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

    try {
        const payload = {
            id_kit_aprovado: budget.id,
            id_imovel: appState.selectedProperty.id,
            valor_total_aprovado: budget.totalPrice,
            potencia_aprovada: budget.systemPower,
            id_fornecedor: budget.supplierId
        };

        const response = await fetch('../../../backend/ClienteBackEnd/orcamentos/aprovar_orcamento.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Tenta converter para JSON com fallback pra evitar crash
        let result;
        try {
            result = await response.json();
        } catch (e) {
            throw new Error("Resposta inválida do servidor.");
        }

        // Caso o PHP retorne erro customizado
        if (!response.ok || result.erro || result.sucesso === false) {
            throw new Error(result.erro || 'Falha ao aprovar orçamento.');
        }

        // Sucesso!
        appState.approvedBudget = {
            ...budget,
            approvedAt: new Date()
        };

        hideModal();
        showToast('Proposta aprovada com sucesso!', 'success');

        setTimeout(() => goToStep(3), 800);

    } catch (error) {
        console.error('Erro na aprovação:', error);
        showToast(error.message || 'Erro inesperado', 'error');
    } finally {
        DOM.modal.confirmBtn.disabled = false;
        DOM.modal.confirmBtn.innerHTML = 'Confirmar Aprovação';
    }
}


async function handleReject(budgetId) {
    const budget = appState.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    const btn = document.querySelector(`button[onclick="handleReject(${budgetId})"]`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        // Chama o PHP para criar o registro de recusa
        const response = await fetch('../../../backend/ClienteBackEnd/orcamentos/recusar_orcamento.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_kit_recusado: budget.id,
                id_imovel: appState.selectedProperty.id,
                valor_total: budget.totalPrice,
                id_fornecedor: budget.supplierId
            })
        });

        const result = await response.json();

        if (result.sucesso) {
            showToast('Proposta recusada e arquivada.', 'warning');

            // Atualiza visualmente o card
            if (btn) {
                const card = btn.closest('.budget-card');
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
                btn.parentElement.innerHTML = '<span style="color:#e53e3e; font-weight:bold;">❌ Recusado</span>';
            }
        } else {
            throw new Error(result.erro || 'Erro ao recusar');
        }

    } catch (error) {
        console.error(error);
        showToast('Erro ao registrar recusa.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Recusar';
        }
    }
}
// --- ETAPA 3 ---
function renderConfirmation() {
    if (!appState.approvedBudget) return;
    const dateStr = appState.approvedBudget.approvedAt.toLocaleDateString('pt-BR');

    DOM.step3.infoBox.innerHTML = `
        <div class="approved-summary">
            <h4 style="color:var(--verde-sucesso); margin-top:0; border-bottom:1px solid #e6f4ea; padding-bottom:15px; margin-bottom:15px;">
                <i class="fas fa-check-circle"></i> Resumo do Pedido
            </h4>
            <div class="summary-row"><span>Imóvel:</span> <strong>${appState.selectedProperty.nome}</strong></div>
            <div class="summary-row"><span>Fornecedor:</span> <strong>${appState.approvedBudget.name}</strong></div>
            <div class="summary-row"><span>Valor Total:</span> <strong>${formatCurrency(appState.approvedBudget.totalPrice)}</strong></div>
            <div class="summary-row"><span>Data:</span> <strong>${dateStr}</strong></div>
            <div class="summary-row" style="border-top:2px solid #e6f4ea; margin-top:15px; padding-top:15px; border-bottom:none;">
                <span>Status:</span>
                <strong style="color: var(--verde-sucesso); display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-thumbs-up"></i> Aprovado
                </strong>
            </div>
        </div>
    `;
}

// --- UTILITÁRIOS ---
function goToStep(stepNumber) {
    appState.currentStep = stepNumber;
    DOM.steps.indicators.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) step.classList.add('completed');
        else if (index + 1 === stepNumber) step.classList.add('active');
    });
    DOM.steps.contents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === stepNumber) content.classList.add('active');
    });

    if (stepNumber === 1) renderPropertiesSelector();
    if (stepNumber === 3) renderConfirmation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startNewQuote() {
    appState.selectedProperty = null;
    appState.budgets = [];
    appState.approvedBudget = null;
    goToStep(1);
}

function showModal() { if (DOM.modal.overlay) DOM.modal.overlay.classList.add('show'); }
function hideModal() { if (DOM.modal.overlay) DOM.modal.overlay.classList.remove('show'); }

function showToast(message, type = 'success') {
    DOM.toast.textContent = message;
    DOM.toast.className = `toast ${type} show`;
    setTimeout(() => DOM.toast.classList.remove('show'), 3000);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function generateStarRating(rating) {
    const r = parseFloat(rating);
    const fullStars = Math.floor(r);
    const halfStar = r % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    let html = '';
    for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
    if (halfStar) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) html += '<i class="far fa-star"></i>';
    return html;
}

function renderLoading(container, message) {
    if (!container) return;
    container.innerHTML = `
        <div style="grid-column: 1/-1; padding: 50px; text-align: center; color: var(--cinza-claro);">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color: var(--azul-primario);"></i>
            <p style="margin-top: 15px; font-weight: 600;">${message}</p>
        </div>
    `;
}