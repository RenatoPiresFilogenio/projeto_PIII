// =========================
// MAPA DE REGIÕES E ESTADOS
// =========================
const estadosPorRegiao = {
    'Norte': [
        { sigla: 'AC', nome: 'Acre' }, { sigla: 'AP', nome: 'Amapá' }, { sigla: 'AM', nome: 'Amazonas' },
        { sigla: 'PA', nome: 'Pará' }, { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' },
        { sigla: 'TO', nome: 'Tocantins' }
    ],
    'Nordeste': [
        { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
        { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'PB', nome: 'Paraíba' }, { sigla: 'PE', nome: 'Pernambuco' },
        { sigla: 'PI', nome: 'Piauí' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'SE', nome: 'Sergipe' }
    ],
    'Centro-Oeste': [
        { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'GO', nome: 'Goiás' },
        { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' }
    ],
    'Sudeste': [
        { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'MG', nome: 'Minas Gerais' },
        { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'SP', nome: 'São Paulo' }
    ],
    'Sul': [
        { sigla: 'PR', nome: 'Paraná' }, { sigla: 'RS', nome: 'Rio Grande do Sul' }, { sigla: 'SC', nome: 'Santa Catarina' }
    ]
};

// Estado da aplicação
let properties = [];
let editingId = null;
let paginaAtual = 1;

// Elementos do DOM
const form = document.getElementById('imovel-form');
const propertiesList = document.getElementById('properties-list');
const emptyState = document.getElementById('empty-state');
const toast = document.getElementById('toast');
const modal = document.getElementById('modal-overlay');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancelar');
const btnSolicitarOrcamento = document.getElementById('btn-solicitar-orcamento');
const accordionCadastro = document.getElementById('accordion-cadastro');
const accTitle = document.querySelector('.acc-title');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProperties();
    setupEventListeners();
    filtrarEstadosPorRegiao(); 
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
        showToast('Redirecionando...', 'success');
        setTimeout(() => { window.location.href = 'Orcamentos.php'; }, 1000);
    });

    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if(e.target===modal) hideModal(); });

    document.getElementById('regiao').addEventListener('change', filtrarEstadosPorRegiao);
}

// Buscar imóveis do banco com Paginação
async function fetchProperties(){
    try {
        const res = await fetch(`../../../backend/ClienteBackEnd/listaimoveis.php?page=${paginaAtual}&_cache=` + new Date().getTime());
        const responseJson = await res.json();
        
        if(responseJson.error) {
             console.error("Erro vindo do backend:", responseJson.error);
             properties = [];
        } else {
             // Adaptação para ler o objeto novo { data: [], paginacao: {} }
             properties = Array.isArray(responseJson) ? responseJson : (responseJson.data || []);
             const paginacao = responseJson.paginacao || null;
             
             if(paginacao) renderPagination(paginacao);
        }
        
        renderProperties();
        updateNavigationState();

    } catch(e){
        console.error("Erro ao buscar imóveis:", e);
        showToast('Erro ao carregar imóveis','error');
        properties = [];
        renderProperties();
    }
}

// Renderizar Paginação
function renderPagination(info) {
    const container = document.getElementById('paginacaoContainer');
    const totalPaginas = parseInt(info.total_paginas);
    const pgAtual = parseInt(info.pagina_atual);

    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    
    // Botão Anterior
    html += `<button class="pagination-btn" onclick="mudarPagina(${pgAtual - 1})" ${pgAtual === 1 ? 'disabled' : ''}>&laquo;</button>`;

    for (let i = 1; i <= totalPaginas; i++) {
        const activeClass = i === pgAtual ? 'active' : '';
        html += `<button class="pagination-btn ${activeClass}" onclick="mudarPagina(${i})">${i}</button>`;
    }

    // Botão Próximo
    html += `<button class="pagination-btn" onclick="mudarPagina(${pgAtual + 1})" ${pgAtual >= totalPaginas ? 'disabled' : ''}>&raquo;</button>`;

    container.innerHTML = html;
}

window.mudarPagina = function(novaPagina) {
    paginaAtual = novaPagina;
    fetchProperties();
}

// Renderizar imóveis (Design Card)
function renderProperties() {
    if (properties.length === 0) {
        propertiesList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    propertiesList.innerHTML = properties.map(p => `
    <div class="property-card" id="imovel-${p.id}">
        <div class="property-header">
            <div>
                <div class="property-title"><i class="fas fa-home"></i> ${p.nome || 'Imóvel sem nome'}</div>
                <div class="property-address">
                    ${p.rua || ''}, ${p.numero || ''} <br>
                    ${p.bairro || ''} - ${p.cidade || ''}/${p.estado || ''}
                </div>
            </div>
            <div class="property-actions">
                <button class="btn-icon" onclick="editProperty('${p.id}')" title="Editar">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn-icon delete" onclick="confirmDeleteProperty('${p.id}')" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div class="property-info">
            <div class="info-item">
                <div class="info-icon"><i class="fas fa-map-marked-alt"></i></div>
                <div class="info-data">
                    <span class="info-label">Região</span>
                    <span class="info-value">${p.regiao || '-'}</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-icon"><i class="fas fa-bolt"></i></div>
                <div class="info-data">
                    <span class="info-label">Consumo</span>
                    <span class="info-value">${p.consumo || '0'} kWh</span>
                </div>
            </div>
        </div>
    </div>
`).join('');
}

// Cadastrar / Atualizar imóvel
async function handleFormSubmit(e){
    e.preventDefault();
    if(!validateForm()) return;

    const formData = new FormData(form);
    if(editingId) formData.append('id', editingId);

    showButtonLoading(true);

    try {
        const res = await fetch('../../../backend/ClienteBackEnd/cadastrarimoveis.php',{
            method:'POST',
            body: formData
        });
        const data = await res.json();
        if(data.success){
            showToast(editingId ? 'Imóvel atualizado!' : 'Imóvel cadastrado!','success');
            resetForm();
            paginaAtual = 1; // Volta pra primeira página ao adicionar
            await fetchProperties();
            // Fecha accordion
            accordionCadastro.removeAttribute('open');
        } else {
            showToast(data.error || 'Erro ao salvar','error');
        }
    } catch(e){
        console.error(e);
        showToast('Erro na requisição','error');
    } finally {
        showButtonLoading(false);
    }
}

// Editar imóvel
function editProperty(id){
    const property = properties.find(p => p.id == id);
    if(!property) return;

    editingId = id;
    document.getElementById('nome').value = property.nome;
    document.getElementById('rua').value = property.rua;
    document.getElementById('numero').value = property.numero;
    document.getElementById('bairro').value = property.bairro;
    document.getElementById('cidade').value = property.cidade;
    document.getElementById('cep').value = property.cep;
    document.getElementById('consumo').value = property.consumo || '';
    
    // Região e Estado
    document.getElementById('regiao').value = property.regiao || '';
    filtrarEstadosPorRegiao(); 
    document.getElementById('estado').value = property.estado;

    // UI Updates
    accTitle.innerHTML = '<i class="fas fa-pencil-alt"></i> Editando Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Salvar Alterações';
    btnCancel.style.display = 'inline-block';
    
    // Abre o Accordion e rola até ele
    accordionCadastro.setAttribute('open', '');
    accordionCadastro.scrollIntoView({behavior:'smooth'});

    showToast('Modo de edição ativado', 'success');
}

// Cancelar edição
function cancelEdit(){
    resetForm();
    showToast('Edição cancelada', 'success');
}

// Reset form
function resetForm(){
    form.reset();
    editingId = null;
    accTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Cadastrar Novo Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Salvar Imóvel';
    btnCancel.style.display = 'none';
    filtrarEstadosPorRegiao();
    accordionCadastro.removeAttribute('open'); // Fecha accordion ao limpar
}

// Confirmar exclusão
function confirmDeleteProperty(id){
    const property = properties.find(p=>p.id==id);
    if(!property) return;

    document.getElementById('modal-message').innerHTML=`Tem certeza que deseja excluir <strong>"${property.nome}"</strong>?`;
    document.getElementById('modal-confirm').onclick=()=> deleteProperty(id);
    showModal();
}

async function deleteProperty(id){
    try {
        const res = await fetch('../../../backend/ClienteBackEnd/excluirImoveis.php',{
            method:'POST',
            body: new URLSearchParams({id})
        });
        const data = await res.json();
        if(data.success){
            showToast('Imóvel excluído','success');
            await fetchProperties();
            hideModal();
        } else {
            showToast(data.error || 'Erro ao deletar','error');
        }
    } catch(e){
        console.error(e);
        showToast('Erro na requisição','error');
    }
}

// Validação do formulário (Simplificada)
function validateForm(){
    const consumo = parseInt(document.getElementById('consumo').value);
    if(consumo && consumo>10000){
        showToast('Consumo muito alto. Verifique.', 'error');
        return false;
    }
    return true;
}

// Filtra Estados
function filtrarEstadosPorRegiao() {
    const regiaoSelect = document.getElementById('regiao');
    const estadoSelect = document.getElementById('estado');
    const selectedRegion = regiaoSelect.value;
    const currentEstado = estadoSelect.value; 

    estadoSelect.innerHTML = '<option value="">Selecione...</option>';

    if (selectedRegion && estadosPorRegiao[selectedRegion]) {
        estadoSelect.disabled = false;
        estadosPorRegiao[selectedRegion].forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = estado.nome;
            estadoSelect.appendChild(option);
        });
        if (currentEstado) estadoSelect.value = currentEstado;
    } else {
        estadoSelect.disabled = true;
    }
}

// UI Helpers
function showToast(message,type='success'){
    toast.textContent=message;
    toast.className=`toast ${type}`;
    toast.classList.add('show');
    setTimeout(()=>{toast.classList.remove('show');},3000);
}

function showModal(){ modal.classList.add('show'); }
function hideModal(){ modal.classList.remove('show'); }

function showButtonLoading(loading){
    const btnText = btnSubmit.querySelector('.btn-text');
    const btnLoading = btnSubmit.querySelector('.btn-loading');
    if(loading){
        btnText.style.display='none';
        btnLoading.style.display='inline';
        btnSubmit.disabled=true;
    } else {
        btnText.style.display='inline';
        btnLoading.style.display='none';
        btnSubmit.disabled=false;
    }
}

function updateNavigationState(){
    if(properties.length===0){
        btnSolicitarOrcamento.style.opacity='0.5';
        btnSolicitarOrcamento.style.cursor='not-allowed';
    } else {
        btnSolicitarOrcamento.style.opacity='1';
        btnSolicitarOrcamento.style.cursor='pointer';
    }
}