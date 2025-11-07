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



// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeStep();
});


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
   
    renderPropertiesSelector(); 
    goToStep(1); 

}

// Mostrar estado vazio
function showEmptyPropertiesState() {
    propertiesSelector.style.display = 'none';
    emptyProperties.style.display = 'block';
}

// Renderizar seletor de propriedades
async function renderPropertiesSelector() {
    
    try {
        // 1. FAZ O FETCH REAL
        const response = await fetch(`../../../backend/ClienteBackEnd/listaimoveis.php`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || `Erro HTTP: ${response.status}`);
        }
        
        const imoveisDoBanco = await response.json();
        
        properties = imoveisDoBanco;
        
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

    } catch (error) {
        console.error('Falha em renderPropertiesSelector:', error);
        showToast(error.message, 'error');
        showEmptyPropertiesState();
    }
}

function selectProperty(propertyId) {
    
    selectedProperty = properties.find(p => p.id.toString() === propertyId.toString());

    if (!selectedProperty) {
        console.error('Imóvel não encontrado no estado global:', propertyId);
        return;
    }

    document.querySelectorAll('.property-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedElement = document.querySelector(`div[onclick="selectProperty('${propertyId}')"]`);
    if(selectedElement) {
        selectedElement.classList.add('selected');
    } else {
        console.warn('Elemento visual não encontrado para selecionar');
    }

    showToast(`Imóvel "${selectedProperty.nome}" selecionado`, 'success');

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
async function proceedToBudgets() {
    
    showToast('Buscando propostas...', 'success'); 

    try {
       
        const response = await fetch(`../../../backend/ClienteBackEnd/orcamentos/buscar_orcamentos.php?id_imovel=${selectedProperty.id}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || `Erro HTTP: ${response.status}`);
        }
        
        const budgetsDoBanco = await response.json();
        
        budgets = budgetsDoBanco;
        
        if (budgets.length === 0) {
            showToast('Nenhuma proposta encontrada para este imóvel.', 'warning');
             goToStep(1); 
             return; 
        }

        goToStep(2);

    } catch (error) {
        console.error('Falha ao buscar orçamentos:', error);
        showToast(error.message, 'error');
    }
}

function renderBudgets() {
    selectedPropertyInfo.innerHTML = `
        <h4>🏠 ${selectedProperty.nome}</h4>
        <p>${selectedProperty.rua}, ${selectedProperty.bairro} - ${selectedProperty.cidade}/${selectedProperty.estado} | Consumo: ${selectedProperty.consumo} kWh/mês</p>
    `;

    
    
    budgetsGrid.innerHTML = budgets.map((budget, index) => {
        
        
        let bestValueBanner = '';
        let bestValueClass = '';  

      
        if (index === 0) {
            bestValueBanner = '<div class="best-value-banner">⭐ MELHOR CUSTO-BENEFÍCIO</div>';
            bestValueClass = 'best-value'; 
        }
        
        
        return `
            <div class="budget-card 
                ${budget.isPremium ? 'premium' : ''} 
                ${bestValueClass} 
            ">
                
                ${bestValueBanner}  <div class="budget-header">
                    <div class="supplier-name">${budget.name}</div>
                    <div class="supplier-rating">
                        <span>⭐ ${budget.rating}</span>
                    </div>
                </div>
                
                <div class="budget-body">
                    <div class="budget-price">
                        <div class="price-label">Valor Total do Sistema</div>
                        <div class="price-value">R$ ${budget.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div class="price-installments">ou 60x de R$ ${budget.monthlyInstallment.toLocaleString('pt-BR')}</div>
                    </div>
                    
                    <div class="products-list">
                        <h5>📦 Produtos Inclusos</h5>
                        <div class="product-item">
                            <span>🔋</span> ${budget.products}
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
        `;
    }).join('');
}
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


async function approveBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId); 
    if (!budget) return;

    showToast('Processando aprovação...', 'success');

    try {
        const response = await fetch(`../../../backend/ClienteBackEnd/orcamentos/aprovar_orcamento.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            
            body: JSON.stringify({ 
                id_kit_aprovado: budgetId,
                id_imovel: selectedProperty.id,
                valor_total_aprovado: budget.totalPrice, 
                potencia_aprovada: budget.systemPower, 
                id_fornecedor: budget.supplierId 
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.erro || 'Falha ao aprovar orçamento');
        }

        approvedBudget = {
            ...budget,
            approvedAt: new Date().toISOString(),
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.nome
        };

        hideModal();
        showToast('Proposta enviada para validação!', 'success'); 

        setTimeout(() => {
            goToStep(3);
        }, 1500);

    } catch (error) {
        console.error('Erro ao aprovar orçamento:', error);
        hideModal();
        showToast(error.message, 'error');
    }
}

function rejectBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    showToast(`Orçamento da ${budget.name} recusado`, 'warning');

    const budgetCards = document.querySelectorAll('.budget-card');
    budgetCards.forEach(card => {
        if (card.querySelector('.supplier-name').textContent === budget.name) {
            card.style.opacity = '0.3';
            card.style.pointerEvents = 'none';
            card.querySelector('.budget-actions').innerHTML = '<span style="color: var(--vermelho-erro); font-weight: bold;">❌ Recusado</span>';
        }
    });
}

function goToStep(stepNumber) {
    currentStep = stepNumber;

    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
        }
    });

    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === stepNumber) {
            content.classList.add('active');
        }
    });

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

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

function startNewQuote() {
    selectedProperty = null;
    budgets = [];
    approvedBudget = null;

    document.querySelectorAll('.property-option').forEach(option => {
        option.classList.remove('selected');
    });

    lowConsumptionWarning.style.display = 'none';

    showToast('Iniciando novo orçamento...', 'success');

    setTimeout(() => {
        goToStep(1);
    }, 1000);
}

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

function simulateLoading(element, duration = 2000) {
    element.classList.add('loading');

    setTimeout(() => {
        element.classList.remove('loading');
    }, duration);
}

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

document.addEventListener('DOMContentLoaded', () => {
    if (properties.length === 0) {
        setTimeout(() => {
            if (properties.length === 0) {
                createDemoProperties();
                initializeStep();
            }
        }, 1000);
    }
});

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

window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.error);
    showToast('Ocorreu um erro inesperado. Tente novamente.', 'error');
});

