const toast = document.getElementById('toast');
const pendingList = document.getElementById('pending-budgets-list');
const historyList = document.getElementById('history-budgets-list');
const emptyPendingMessage = document.getElementById('empty-pending-message');
const emptyHistoryMessage = document.getElementById('empty-history-message');

document.addEventListener('DOMContentLoaded', () => {
    loadMyBudgets();

    const filtroHistorico = document.getElementById('filtro-historico');
    if (filtroHistorico) {
        filtroHistorico.addEventListener('change', () => {
            filtrarHistorico(filtroHistorico.value);
        });
    }
});

async function loadMyBudgets() {
    try {
        const response = await fetch('../../../backend/ClienteBackEnd/orcamentos/listar_meus_orcamentos.php?_cache=' + new Date().getTime());
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

function renderBudgetList(budgets, container, emptyMessage) {
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

function createBudgetCard(budget) {
    const card = document.createElement('div');
    card.className = `admin-budget-card ${budget.status_class}`; 
    card.id = `budget-card-${budget.id_orcamento}`;

    const budgetDate = new Date(budget.data).toLocaleDateString('pt-BR');

    card.innerHTML = `
        <div class="card-header">
            <span class="status-badge ${budget.status_class}">${budget.status_texto || 'Processado'}</span>
            <strong>Pedido #${budget.id_orcamento}</strong>
        </div>
        <div class="card-body">
            <p><strong>Imóvel:</strong> ${budget.imovel_nome} (Consumo: ${budget.imovel_consumo} kWh)</p>
            <p><strong>Fornecedor:</strong> ${budget.fornecedor_nome}</p>
            <p><strong>Produtos:</strong> ${budget.produtos}</p>
            <p class="price">Valor: ${parseFloat(budget.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p class="date">Enviado em: ${budgetDate}</p>
        </div>
    `;

    return card;
}

function filtrarHistorico(filtro) {
    const cards = historyList.querySelectorAll('.admin-budget-card');
    let hasVisibleCards = false;

    cards.forEach(card => {
        if (filtro === 'todos') {
            card.style.display = 'block';
            hasVisibleCards = true;
        } else if (card.classList.contains(filtro)) {
            card.style.display = 'block';
            hasVisibleCards = true;
        } else {
            card.style.display = 'none';
        }
    });

    if (!hasVisibleCards && cards.length > 0) {
        emptyHistoryMessage.innerHTML = '<h4>Nenhum orçamento encontrado para este filtro</h4>';
        emptyHistoryMessage.style.display = 'block';
    } else if (cards.length > 0) {
        emptyHistoryMessage.style.display = 'none';
    } else if (cards.length === 0) {
        emptyHistoryMessage.innerHTML = '<h4>Nenhum histórico</h4><p>Você ainda não tem orçamentos aprovados ou negados.</p>';
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    if (type === 'loading') return;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}