// Estado da aplicação
let properties = JSON.parse(localStorage.getItem('properties')) || [];
let editingId = null;

// Elementos do DOM
const form = document.getElementById('imovel-form');
const propertiesList = document.getElementById('properties-list');
const emptyState = document.getElementById('empty-state');
const toast = document.getElementById('toast');
const modal = document.getElementById('modal-overlay');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancelar');
const btnSolicitarOrcamento = document.getElementById('btn-solicitar-orcamento');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderProperties();
    setupEventListeners();
    updateNavigationState();
});

// Event Listeners
function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    btnCancel.addEventListener('click', cancelEdit);
    btnSolicitarOrcamento.addEventListener('click', () => {
        if (properties.length === 0) {
            showToast('Cadastre pelo menos um imóvel antes de solicitar orçamentos', 'error');
            return;
        }
        // Simular navegação para página de orçamentos
        showToast('Redirecionando para página de orçamentos...', 'success');
        setTimeout(() => {
            window.location.href = 'orcamentos.html';
        }, 1500);
    });
    
    // Modal events
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideModal();
    });
    
    // Navigation
    document.getElementById('nav-orcamentos').addEventListener('click', (e) => {
        e.preventDefault();
        if (properties.length === 0) {
            showToast('Cadastre pelo menos um imóvel antes de acessar orçamentos', 'error');
            return;
        }
        showToast('Redirecionando para orçamentos...', 'success');
        setTimeout(() => {
            window.location.href = 'orcamentos.html';
        }, 1500);
    });
    
    // Auto-select region based on state
    document.getElementById('estado').addEventListener('change', updateRegionByState);
}

// Form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const formData = new FormData(form);
    const propertyData = {
        id: editingId || Date.now().toString(),
        nome: formData.get('nome').trim(),
        rua: formData.get('rua').trim(),
        bairro: formData.get('bairro').trim(),
        cidade: formData.get('cidade').trim(),
        estado: formData.get('estado'),
        regiao: formData.get('regiao'),
        consumo: parseInt(formData.get('consumo')),
        observacoes: formData.get('observacoes').trim(),
        createdAt: editingId ? properties.find(p => p.id === editingId).createdAt : new Date().toISOString()
    };
    
    showButtonLoading(true);
    
    // Simular processamento
    setTimeout(() => {
        if (editingId) {
            const index = properties.findIndex(p => p.id === editingId);
            properties[index] = propertyData;
            showToast('✅ Imóvel atualizado com sucesso!', 'success');
        } else {
            properties.push(propertyData);
            showToast('✅ Imóvel cadastrado com sucesso!', 'success');
        }
        
        saveProperties();
        renderProperties();
        resetForm();
        showButtonLoading(false);
        updateNavigationState();
    }, 1000);
}

// Form validation
function validateForm() {
    const fields = [
        { id: 'nome', message: 'Nome do imóvel é obrigatório' },
        { id: 'rua', message: 'Rua é obrigatória' },
        { id: 'bairro', message: 'Bairro é obrigatório' },
        { id: 'cidade', message: 'Cidade é obrigatória' },
        { id: 'estado', message: 'Estado é obrigatório' },
        { id: 'regiao', message: 'Região é obrigatória' },
        { id: 'consumo', message: 'Consumo mensal é obrigatório' }
    ];
    
    let isValid = true;
    
    // Clear previous errors
    fields.forEach(field => {
        clearFieldError(field.id);
    });
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        if (!value || (field.id === 'consumo' && (isNaN(value) || parseInt(value) <= 0))) {
            showFieldError(field.id, field.message);
            isValid = false;
        }
    });
    
    // Additional validation for consumption
    const consumo = parseInt(document.getElementById('consumo').value);
    if (consumo && consumo > 10000) {
        showFieldError('consumo', 'Consumo muito alto. Verifique o valor inserido.');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error-${fieldId}`);
    
    field.classList.add('error');
    errorElement.textContent = message;
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error-${fieldId}`);
    
    field.classList.remove('error');
    errorElement.textContent = '';
}

// Region auto-selection based on state
function updateRegionByState() {
    const estado = document.getElementById('estado').value;
    const regiao = document.getElementById('regiao');
    
    const regioesPorEstado = {
        'AC': 'Norte', 'AM': 'Norte', 'AP': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
        'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
        'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
        'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
        'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
    };
    
    if (regioesPorEstado[estado]) {
        regiao.value = regioesPorEstado[estado];
    }
}

// Properties management
function renderProperties() {
    if (properties.length === 0) {
        propertiesList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    propertiesList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    propertiesList.innerHTML = properties.map(property => `
        <div class="property-card">
            <div class="property-header">
                <div>
                    <div class="property-title">🏠 ${property.nome}</div>
                    <div class="property-address">${property.rua}, ${property.bairro} - ${property.cidade}/${property.estado}</div>
                </div>
                <div class="property-actions">
                    <button class="btn btn-primary btn-icon" onclick="editProperty('${property.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn btn-danger btn-icon" onclick="confirmDeleteProperty('${property.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="property-info">
                <div class="info-item">
                    <span class="info-icon">🌍</span>
                    <div>
                        <div class="info-label">Região</div>
                        <div class="info-value">${property.regiao}</div>
                    </div>
                </div>
                <div class="info-item">
                    <span class="info-icon">⚡</span>
                    <div>
                        <div class="info-label">Consumo Mensal</div>
                        <div class="info-value">${property.consumo} kWh</div>
                    </div>
                </div>
            </div>
            
            ${property.observacoes ? `
                <div class="property-observations">
                    <strong>Observações:</strong> ${property.observacoes}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function editProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    editingId = id;
    
    // Fill form with property data
    document.getElementById('nome').value = property.nome;
    document.getElementById('rua').value = property.rua;
    document.getElementById('bairro').value = property.bairro;
    document.getElementById('cidade').value = property.cidade;
    document.getElementById('estado').value = property.estado;
    document.getElementById('regiao').value = property.regiao;
    document.getElementById('consumo').value = property.consumo;
    document.getElementById('observacoes').value = property.observacoes || '';
    
    // Update UI
    formTitle.textContent = 'Editar Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Salvar Alterações';
    btnCancel.style.display = 'inline-flex';
    
    // Clear any errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    showToast('Modo de edição ativado', 'success');
}

function cancelEdit() {
    resetForm();
    showToast('Edição cancelada', 'success');
}

function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = 'Cadastrar Novo Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Cadastrar Imóvel';
    btnCancel.style.display = 'none';
    
    // Clear errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function confirmDeleteProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    document.getElementById('modal-title').textContent = 'Confirmar Exclusão';
    document.getElementById('modal-message').innerHTML = `
        Tem certeza que deseja excluir o imóvel <strong>"${property.nome}"</strong>?<br>
        Esta ação não pode ser desfeita.
    `;
    
    document.getElementById('modal-confirm').onclick = () => deleteProperty(id);
    showModal();
}

function deleteProperty(id) {
    properties = properties.filter(p => p.id !== id);
    saveProperties();
    renderProperties();
    hideModal();
    updateNavigationState();
    
    showToast('🗑️ Imóvel excluído com sucesso', 'success');
    
    // If we were editing this property, reset the form
    if (editingId === id) {
        resetForm();
    }
}

// Utility functions
function saveProperties() {
    localStorage.setItem('properties', JSON.stringify(properties));
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

function showButtonLoading(loading) {
    const btnText = btnSubmit.querySelector('.btn-text');
    const btnLoading = btnSubmit.querySelector('.btn-loading');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btnSubmit.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btnSubmit.disabled = false;
    }
}

function updateNavigationState() {
    const navOrcamentos = document.getElementById('nav-orcamentos');
    const btnSolicitarOrcamento = document.getElementById('btn-solicitar-orcamento');
    
    if (properties.length === 0) {
        navOrcamentos.style.opacity = '0.6';
        btnSolicitarOrcamento.style.opacity = '0.6';
    } else {
        navOrcamentos.style.opacity = '1';
        btnSolicitarOrcamento.style.opacity = '1';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal.classList.contains('show')) {
            hideModal();
        } else if (editingId) {
            cancelEdit();
        }
    }
});