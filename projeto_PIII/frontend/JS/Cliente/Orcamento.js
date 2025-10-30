// Estado da aplicação
let properties = [];
let selectedProperty = null;
let budgets = [];
let approvedBudget = null;
let currentStep = 1;

// Elementos do DOM
const toast = document.getElementById('toast');
const modal = document.getElementById('modal-overlay');
const propertiesSelector = document.getElementById('properties-selector');
const emptyProperties = document.getElementById('empty-properties');
const lowConsumptionWarning = document.getElementById('low-consumption-warning');
const budgetsGrid = document.getElementById('budgets-grid');
const selectedPropertyInfo = document.getElementById('selected-property-info');

// Dados simulados de fornecedores
const suppliers = [
    {
        id: 1,
        name: "SolarTech Pro",
        rating: 4.8,
        isPremium: true,
        basePrice: 25000,
        installmentMultiplier: 0.08,
        panels: "Painel Canadian Solar 450W",
    },
    {
        id: 2,
        name: "EcoSolar Systems",
        rating: 4.6,
        isPremium: false,
        basePrice: 28000,
        installmentMultiplier: 0.075,
        panels: "Painel Jinko Solar 440W",
    },
    {
        id: 3,
        name: "GreenEnergy Solutions",
        rating: 4.7,
        isPremium: false,
        basePrice: 23500,
        installmentMultiplier: 0.09,
        panels: "Painel Trina Solar 445W",
    }
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    setupEventListeners();
    initializeStep();
});

// Carregar propriedades do localStorage
function loadProperties() {
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
        properties = JSON.parse(storedProperties);
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('nav-imoveis').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
    
    // Modal events
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.classList.contains('show')) {
                hideModal();
            }
        }
    });
}

// Inicializar etapa atual
function initializeStep() {
    if (properties.length === 0) {
        showEmptyPropertiesState();
        return;
    }
    
    renderPropertiesSelector();
    goToStep(1);
}

// Mostrar estado vazio
function showEmptyPropertiesState() {
    propertiesSelector.style.display = 'none';
    emptyProperties.style.display = 'block';
}

// Renderizar seletor de propriedades
function renderPropertiesSelector() {
    if (properties.length === 0) {
        showEmptyPropertiesState();
        return;
    }
    
    propertiesSelector.style.display = 'grid';
    emptyProperties.style.display = 'none';
    
    propertiesSelector.innerHTML = properties.map(property => `
        <div class="property-option" onclick="selectProperty('${property.id}')">
            <div class="property-name">
                🏠 ${property.nome}
            </div>
            <div class="property-address">
                ${property.rua}, ${property.bairro} - ${property.cidade}/${property.estado}
            </div>
            <div class="property-details">
                <div class="detail-item">
                    <span class="detail-icon">🌍</span>
                    <div>
                        <div class="detail-label">Região</div>
                        <div class="detail-value">${property.regiao}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">⚡</span>
                    <div>
                        <div class="detail-label">Consumo</div>
                        <div class="detail-value">${property.consumo} kWh</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Selecionar propriedade
function selectProperty(propertyId) {
    selectedProperty = properties.find(p => p.id === propertyId);
    
    if (!selectedProperty) return;
    
    // Marcar como selecionada visualmente
    document.querySelectorAll('.property-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    showToast(`Imóvel "${selectedProperty.nome}" selecionado`, 'success');
    
    // Verificar consumo baixo
    if (selectedProperty.consumo < 200) {
        showLowConsumptionWarning();
    } else {
        proceedToBudgets();
    }
}

// Mostrar aviso de consumo baixo
function showLowConsumptionWarning() {
    lowConsumptionWarning.style.display = 'block';
    document.getElementById('consumption-value').textContent = selectedProperty.consumo;
    
    // Scroll para o aviso
    lowConsumptionWarning.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Voltar à seleção de propriedade
function backToPropertySelection() {
    lowConsumptionWarning.style.display = 'none';
    selectedProperty = null;
    
    document.querySelectorAll('.property-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    showToast('Seleção cancelada', 'success');
}

// Prosseguir com consumo baixo
function proceedWithLowConsumption() {
    lowConsumptionWarning.style.display = 'none';
    showToast('Continuando com a simulação...', 'warning');
    
    setTimeout(() => {
        proceedToBudgets();
    }, 1000);
}

// Prosseguir para orçamentos
function proceedToBudgets() {
    generateBudgets();
    goToStep(2);
}

// Gerar orçamentos baseados na propriedade
function generateBudgets() {
    const consumption = selectedProperty.consumo;
    const regionMultiplier = getRegionMultiplier(selectedProperty.regiao);
    
    budgets = suppliers.map(supplier => {
        const basePrice = supplier.basePrice;
        const consumptionFactor = Math.max(0.5, Math.min(2, consumption / 350)); // Fator baseado no consumo médio de 350kWh
        const finalPrice = Math.round((basePrice * consumptionFactor * regionMultiplier) / 100) * 25;
        
        return {
            ...supplier,
            totalPrice: finalPrice,
            monthlyInstallment: Math.round((finalPrice * supplier.installmentMultiplier) / 10) * 10,
            estimatedSavings: Math.round(consumption * 0.85 * 0.75), // 85% da conta, R$ 0,75 por kWh
            panelQuantity: Math.ceil(consumption * 12 / 5400), // Estimativa baseada na geração anual
            systemPower: Math.round((Math.ceil(consumption * 12 / 5400) * 0.45) * 10) / 10 // 450W por painel
        };
    });
    
    // Ordenar por melhor custo-benefício (menor preço primeiro)
    budgets.sort((a, b) => a.totalPrice - b.totalPrice);
    
    // Marcar o primeiro como premium se não tiver um premium definido
    if (!budgets.some(b => b.isPremium)) {
        budgets[0].isPremium = true;
    }
}

// Multiplicador por região (baseado na irradiação solar)
function getRegionMultiplier(region) {
    const multipliers = {
        'Nordeste': 0.85,    // Maior irradiação, menor necessidade de painéis
        'Centro-Oeste': 0.90,
        'Sudeste': 1.0,      // Base
        'Sul': 1.1,          // Menor irradiação, maior necessidade
        'Norte': 0.95
    };
    return multipliers[region] || 1.0;
}

// Renderizar orçamentos
function renderBudgets() {
    selectedPropertyInfo.innerHTML = `
        <h4>🏠 ${selectedProperty.nome}</h4>
        <p>${selectedProperty.rua}, ${selectedProperty.bairro} - ${selectedProperty.cidade}/${selectedProperty.estado} | Consumo: ${selectedProperty.consumo} kWh/mês</p>
    `;
    
    budgetsGrid.innerHTML = budgets.map(budget => `
        <div class="budget-card ${budget.isPremium ? 'premium' : ''}">
            <div class="budget-header">
                <div class="supplier-name">${budget.name}</div>
                <div class="supplier-rating">
                    <span>⭐ ${budget.rating}</span>
                    <span>(${Math.floor(Math.random() * 200) + 50} avaliações)</span>
                </div>
            </div>
            
            <div class="budget-body">
                <div class="budget-price">
                    <div class="price-label">Valor Total do Sistema</div>
                    <div class="price-value">R$ ${budget.totalPrice.toLocaleString('pt-BR')}</div>
                    <div class="price-installments">ou 60x de R$ ${budget.monthlyInstallment.toLocaleString('pt-BR')}</div>
                </div>
                
                <div class="products-list">
                    <h5>📦 Produtos Inclusos</h5>
                    <div class="product-item">
                        <span>🔋</span> ${budget.panelQuantity} x ${budget.panels}
                    </div>
                    <div class="product-item">
                        <span>⚡</span> 1 x ${budget.inverter}
                    </div>
                </div>
                
                <div class="budget-details">
                    <div class="detail-row">
                        <span class="label">Potência do Sistema</span>
                        <span class="value">${budget.systemPower} kWp</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Economia Mensal Estimada</span>
                        <span class="value">R$ ${budget.estimatedSavings.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
                
                <div class="budget-actions">
                    <button class="btn btn-danger" onclick="rejectBudget(${budget.id})">
                        ❌ Recusar
                    </button>
                    <button class="btn btn-success" onclick="confirmApproval(${budget.id})">
                        ✅ Aprovar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Confirmar aprovação (mostrar modal)
function confirmApproval(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;
    
    document.getElementById('modal-title').textContent = 'Confirmar Aprovação';
    document.getElementById('modal-budget-summary').innerHTML = `
        <h5>${budget.name}</h5>
        <p><strong>Valor:</strong> R$ ${budget.totalPrice.toLocaleString('pt-BR')} ou 60x de R$ ${budget.monthlyInstallment.toLocaleString('pt-BR')}</p>
        <p><strong>Sistema:</strong> ${budget.systemPower} kWp com ${budget.panelQuantity} painéis</p>
        <p><strong>Economia mensal:</strong> R$ ${budget.estimatedSavings.toLocaleString('pt-BR')}</p>
    `;
    
    document.getElementById('modal-confirm').onclick = () => approveBudget(budgetId);
    showModal();
}

// Aprovar orçamento
function approveBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;
    
    approvedBudget = {
        ...budget,
        approvedAt: new Date().toISOString(),
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.nome
    };
    
    hideModal();
    showToast('Orçamento aprovado com sucesso!', 'success');
    
    setTimeout(() => {
        goToStep(3);
    }, 1500);
}

// Recusar orçamento
function rejectBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;
    
    showToast(`Orçamento da ${budget.name} recusado`, 'warning');
    
    // Remover o card visualmente
    const budgetCards = document.querySelectorAll('.budget-card');
    budgetCards.forEach(card => {
        if (card.querySelector('.supplier-name').textContent === budget.name) {
            card.style.opacity = '0.3';
            card.style.pointerEvents = 'none';
            card.querySelector('.budget-actions').innerHTML = '<span style="color: var(--vermelho-erro); font-weight: bold;">❌ Recusado</span>';
        }
    });
}

// Navegação entre etapas
function goToStep(stepNumber) {
    currentStep = stepNumber;
    
    // Atualizar indicadores de progresso
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
        }
    });
    
    // Mostrar conteúdo da etapa
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === stepNumber) {
            content.classList.add('active');
        }
    });
    
    // Executar ações específicas da etapa
    switch (stepNumber) {
        case 1:
            renderPropertiesSelector();
            break;
        case 2:
            renderBudgets();
            break;
        case 3:
            renderConfirmation();
            break;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Renderizar confirmação
function renderConfirmation() {
    if (!approvedBudget) return;
    
    const approvalDate = new Date(approvedBudget.approvedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('approved-budget-info').innerHTML = `
        <h4>📋 Detalhes do Orçamento Aprovado</h4>
        <div class="detail-row">
            <span class="label">Fornecedor</span>
            <span class="value">${approvedBudget.name}</span>
        </div>
        <div class="detail-row">
            <span class="label">Imóvel</span>
            <span class="value">${approvedBudget.propertyName}</span>
        </div>
        <div class="detail-row">
            <span class="label">Valor Total</span>
            <span class="value">R$ ${approvedBudget.totalPrice.toLocaleString('pt-BR')}</span>
        </div>
        <div class="detail-row">
            <span class="label">Parcelas</span>
            <span class="value">32x de R$ ${approvedBudget.monthlyInstallment.toLocaleString('pt-BR')}</span>
        </div>
        <div class="detail-row">
            <span class="label">Sistema</span>
            <span class="value">${approvedBudget.systemPower} kWp (${approvedBudget.panelQuantity} painéis)</span>
        </div>
    `;
    
    document.getElementById('approval-date').textContent = approvalDate;
}

// Iniciar novo orçamento
function startNewQuote() {
    selectedProperty = null;
    budgets = [];
    approvedBudget = null;
    
    // Limpar seleções visuais
    document.querySelectorAll('.property-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Esconder aviso de consumo baixo
    lowConsumptionWarning.style.display = 'none';
    
    showToast('Iniciando novo orçamento...', 'success');
    
    setTimeout(() => {
        goToStep(1);
    }, 1000);
}

// Utility functions
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function showModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Simulação de dados para demonstração (caso não tenha propriedades)
function createDemoProperties() {
    if (properties.length === 0) {
        properties = [
            {
                id: 'demo1',
                nome: 'Casa Principal',
                rua: 'Rua das Flores, 123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                regiao: 'Sudeste',
                consumo: 450,
                observacoes: 'Casa com piscina',
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo2',
                nome: 'Apartamento',
                rua: 'Av. Paulista, 1000',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                estado: 'SP',
                regiao: 'Sudeste',
                consumo: 180,
                observacoes: '',
                createdAt: new Date().toISOString()
            }
        ];
        
        showToast('Propriedades de demonstração carregadas', 'success');
    }
}

// Função para simular delay de carregamento
function simulateLoading(element, duration = 2000) {
    element.classList.add('loading');
    
    setTimeout(() => {
        element.classList.remove('loading');
    }, duration);
}

// Validações e verificações
function validatePropertySelection() {
    if (!selectedProperty) {
        showToast('Selecione um imóvel antes de continuar', 'error');
        return false;
    }
    return true;
}

function calculateROI(budget, property) {
    const monthlyConsumption = property.consumo;
    const averageEnergyPrice = 0.75; // R$ 0,75 por kWh
    const monthlySavings = monthlyConsumption * averageEnergyPrice * 0.85; // 85% de economia
    const paybackYears = budget.totalPrice / (monthlySavings * 12);
    
    return {
        monthlySavings: Math.round(monthlySavings),
        paybackYears: Math.round(paybackYears * 10) / 10,
        totalSavings25Years: Math.round(monthlySavings * 12 * 25 - budget.totalPrice)
    };
}

// Formatação de valores
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

// Event handlers adicionais
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se existe ao menos uma propriedade para demo
    if (properties.length === 0) {
        // Aguardar um pouco para ver se as propriedades são carregadas
        setTimeout(() => {
            if (properties.length === 0) {
                createDemoProperties();
                initializeStep();
            }
        }, 1000);
    }
});

// Função para debug (remover em produção)
window.debugApp = {
    properties,
    selectedProperty,
    budgets,
    approvedBudget,
    currentStep,
    goToStep,
    selectProperty: (id) => {
        const property = properties.find(p => p.id === id);
        if (property) {
            selectedProperty = property;
            console.log('Property selected:', property);
        }
    },
    generateBudgets: () => {
        if (selectedProperty) {
            generateBudgets();
            console.log('Generated budgets:', budgets);
        } else {
            console.log('No property selected');
        }
    }
};

// Tratamento de erros globais
window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.error);
    showToast('Ocorreu um erro inesperado. Tente novamente.', 'error');
});

