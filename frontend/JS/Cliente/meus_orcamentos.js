const toast = document.getElementById('toast');

const pendingList = document.getElementById('pending-budgets-list');
const historyList = document.getElementById('history-budgets-list');

const emptyPendingMessage = document.getElementById('empty-pending-message');
const emptyHistoryMessage = document.getElementById('empty-history-message');


document.addEventListener('DOMContentLoaded', () => {
    loadMyBudgets();
});


async function loadMyBudgets() {
    try {
        const response = await fetch('../../../backend/ClienteBackEnd/orcamentos/listar_meus_orcamentos.php');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Falha ao carregar seus orçamentos');
        }

        const data = await response.json();
        
        renderBudgetList(data.pending, pendingList, emptyPendingMessage);
        renderBudgetList(data.history, historyList, emptyHistoryMessage);

    } catch (error) {
        console.error('Erro em loadMyBudgets:', error);
        showToast(error.message, 'error');
    }
}

/**
 * 
 * @param {Array} budgets 
 * @param {HTMLElement} container 
 * @param {HTMLElement} emptyMessage 
 */
function renderBudgetList(budgets, container, emptyMessage) {
    // Limpa a lista antes de inserir
    container.innerHTML = ''; 

    if (budgets.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    budgets.forEach(budget => {
        const card = createBudgetCard(budget);
        container.appendChild(card);
    });
}

/**
 * Cria o elemento HTML de um card de orçamento
 * @param {Object} budget - O objeto de orçamento vindo do PHP
 */
function createBudgetCard(budget) {
    const card = document.createElement('div');
    card.className = `admin-budget-card ${budget.status_class}`; 
    card.id = `budget-card-${budget.id_orcamento}`;

    const budgetDate = new Date(budget.data).toLocaleDateString('pt-BR');

    card.innerHTML = `
        <div class="card-header">
            <span class="status-badge ${budget.status_class}">${budget.status_texto}</span>
            <strong>Pedido #${budget.id_orcamento}</strong>
        </div>
        <div class="card-body">
            <p><strong>Imóvel:</strong> ${budget.imovel_nome} (Consumo: ${budget.imovel_consumo} kWh)</p>
            <p><strong>Fornecedor:</strong> ${budget.fornecedor_nome}</p>
            <p><strong>Produtos:</strong> ${budget.produtos}</p>
            <p class="price">Valor: R$ ${parseFloat(budget.valor_total).toLocaleString('pt-BR')}</p>
            <p class="date">Enviado em: ${budgetDate}</p>
        </div>
    `;

    return card;
}

/**
 * @param {string} message 
 * @param {string} type 
 */
function showToast(message, type = 'success') {
toast.textContent = message;
toast.className = `toast ${type}`;
toast.classList.add('show');

    if (type === 'loading') return;

setTimeout(() => {
toast.classList.remove('show');
}, 4000);
}