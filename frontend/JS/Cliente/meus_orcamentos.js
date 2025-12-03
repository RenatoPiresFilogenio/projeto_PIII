// ===========================================
// JS - MEUS ORÇAMENTOS (Cliente)
// ===========================================

const state = {
    approved: [],
    denied: [],
    pageApproved: 1,
    pageDenied: 1,
    itemsPerPage: 6
};

const DOM = {
    approvedList: document.getElementById('approved-list'),
    deniedList: document.getElementById('denied-list'),
    paginationApproved: document.getElementById('pagination-approved'),
    paginationDenied: document.getElementById('pagination-denied'),
    emptyApproved: document.getElementById('empty-approved'),
    emptyDenied: document.getElementById('empty-denied'),
    toast: document.getElementById('toast')
};

document.addEventListener('DOMContentLoaded', () => {
    fetchMyBudgets();
});

async function fetchMyBudgets() {
    try {
        const response = await fetch('../../../backend/ClienteBackEnd/orcamentos/listar_meus_orcamentos.php?_cache=' + new Date().getTime());
        const data = await response.json();
        const history = data.history || [];

        // Separa o joio do trigo
        state.approved = history.filter(b => b.status_class === 'approved');
        state.denied = history.filter(b => b.status_class === 'denied' || b.status_class === 'rejeitado');

        renderList('approved');
        renderList('denied');

    } catch (error) {
        console.error(error);
    }
}

function renderList(type) {
    const list = type === 'approved' ? state.approved : state.denied;
    const page = type === 'approved' ? state.pageApproved : state.pageDenied;
    const container = type === 'approved' ? DOM.approvedList : DOM.deniedList;
    const emptyMsg = type === 'approved' ? DOM.emptyApproved : DOM.emptyDenied;
    const pagContainer = type === 'approved' ? DOM.paginationApproved : DOM.paginationDenied;

    if (list.length === 0) {
        container.style.display = 'none';
        emptyMsg.style.display = 'block';
        pagContainer.innerHTML = '';
        return;
    }

    emptyMsg.style.display = 'none';
    container.style.display = 'grid';

    // Paginação Local
    const start = (page - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const items = list.slice(start, end);
    const totalPages = Math.ceil(list.length / state.itemsPerPage);

    container.innerHTML = items.map(b => createCardHTML(b)).join('');
    renderPagination(pagContainer, page, totalPages, type);
}

function createCardHTML(budget) {
    const date = new Date(budget.data + 'T00:00:00').toLocaleDateString('pt-BR');
    const value = parseFloat(budget.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const icon = (budget.status_class === 'denied' || budget.status_class === 'rejeitado') ? 'ban' : 'check-circle';

    return `
        <div class="budget-card">
            <div class="card-header">
                <span class="card-id">#${budget.id_orcamento}</span>
                <span class="status-badge ${budget.status_class}"><i class="fas fa-${icon}"></i> ${budget.status_texto}</span>
            </div>
            <div class="card-body">
                <p><strong>Imóvel:</strong> ${budget.imovel_nome}</p>
                <p><strong>Fornecedor:</strong> ${budget.fornecedor_nome}</p>
                <p><strong>Data:</strong> ${date}</p>
                <span class="price-tag">${value}</span>
            </div>
        </div>
    `;
}

function renderPagination(container, currentPage, totalPages, type) {
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let html = '';
    html += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="pagination-btn ${activeClass}" onclick="changePage('${type}', ${i})">${i}</button>`;
    }
    html += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>&raquo;</button>`;
    container.innerHTML = html;
}

window.changePage = function (type, newPage) {
    if (type === 'approved') state.pageApproved = newPage;
    else state.pageDenied = newPage;
    renderList(type);
}