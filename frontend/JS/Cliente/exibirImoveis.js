// Estado da aplicação
let properties = [];
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
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProperties();
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
        showToast('Redirecionando para página de orçamentos...', 'success');
        setTimeout(() => {
            window.location.href = 'orcamentos.php';
        }, 1500);
    });

    // Modal
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if(e.target===modal) hideModal();
    });

    // Navegação
    document.getElementById('nav-orcamentos').addEventListener('click', (e)=>{
        e.preventDefault();
        if(properties.length===0){
            showToast('Cadastre pelo menos um imóvel antes de acessar orçamentos','error');
            return;
        }
        showToast('Redirecionando para orçamentos...','success');
        setTimeout(()=>{window.location.href='orcamentos.php';},1500);
    });

    // Auto-select região
    document.getElementById('estado').addEventListener('change', updateRegionByState);

    // Atalhos
    document.addEventListener('keydown',(e)=>{
        if(e.key==='Escape'){
            if(modal.classList.contains('show')) hideModal();
            else if(editingId) cancelEdit();
        }
    });
}

// Buscar imóveis do banco
async function fetchProperties(){
    try {
        const res = await fetch('../../../backend/ClienteBackEnd/listaimoveis.php');
        const data = await res.json();
        console.log('Imóveis:', data); // Debug
        properties = data;
        console.log("error" + properties);
        renderProperties();
    } catch(e){
        console.error(e);
        showToast('Erro ao carregar imóveis','error');
    }
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
            showToast(editingId ? '✅ Imóvel atualizado!' : '✅ Imóvel cadastrado!','success');
            resetForm();
            await fetchProperties();
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

// Renderizar imóveis
function renderProperties() {
    if (properties.length === 0) {
        propertiesList.style.display = 'none';
        emptyState.style.display = 'block';
        updateNavigationState();
        return;
    }

    propertiesList.style.display = 'grid';
    emptyState.style.display = 'none';

    propertiesList.innerHTML = properties.map(p => `
    <div class="property-card">
        <div class="property-header">
            <div>
                <div class="property-title">🏠 ${p.nome || '-'}</div>
                <div class="property-address">
                    ${p.rua || '-'}, ${p.numero || '-'} - ${p.bairro || '-'}, ${p.cidade || '-'} / ${p.estado || '-'} - CEP: ${p.cep || '-'},
                </div>
            </div>
            <input type="hidden" id="${p.id}" name="${p.id}">
            <div class="property-actions">
                <button class="btn btn-primary btn-icon" onclick="editProperty('${p.id}')" title="Editar">✏️</button>
                <button class="btn btn-danger btn-icon" onclick="confirmDeleteProperty('${p.id}')" title="Excluir">🗑️</button>
            </div>
        </div>
        <div class="property-info">
            <div class="info-item"><span class="info-icon">🌍</span>
                <div>
                    <div class="info-label">Região</div>
                    <div class="info-value">${p.regiao || 'Não informado'}</div>
                </div>
            </div>
            <div class="info-item"><span class="info-icon">⚡</span>
                <div>
                    <div class="info-label">Consumo Mensal</div>
                    <div class="info-value">${p.consumo || '-'}</div>
                </div>
            </div>
        </div>
    </div>
`).join('');

    updateNavigationState();
}

// Editar imóvel
function editProperty(id){
    const property = properties.find(p => p.id == id);
    if(!property) return;

    editingId = id;
    document.getElementById('nome').value = property.nome;
    document.getElementById('rua').value = property.rua;
    document.getElementById('bairro').value = property.bairro;
    document.getElementById('cidade').value = property.cidade;
    document.getElementById('estado').value = property.estado;
    document.getElementById('regiao').value = property.regiao || '';
    document.getElementById('consumo').value = property.consumo || '';

    formTitle.textContent = 'Editar Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Salvar Alterações';
    btnCancel.style.display = 'inline-flex';
    document.querySelectorAll('.error-message').forEach(el=>el.textContent='');
    document.querySelectorAll('.error').forEach(el=>el.classList.remove('error'));
    document.querySelector('.form-section').scrollIntoView({behavior:'smooth'});

    showToast('Modo de edição ativado','success');
}

// Cancelar edição
function cancelEdit(){
    resetForm();
    showToast('Edição cancelada','success');
}

// Reset form
function resetForm(){
    form.reset();
    editingId = null;
    formTitle.textContent = 'Cadastrar Novo Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Cadastrar Imóvel';
    btnCancel.style.display = 'none';
    document.querySelectorAll('.error-message').forEach(el=>el.textContent='');
    document.querySelectorAll('.error').forEach(el=>el.classList.remove('error'));
}

// Confirmar exclusão
function confirmDeleteProperty(id){
    const property = properties.find(p=>p.id==id);
    if(!property) return;

    document.getElementById('modal-title').textContent='Confirmar Exclusão';
    document.getElementById('modal-message').innerHTML=`Tem certeza que deseja excluir o imóvel <strong>"${property.nome}"</strong>?<br>Esta ação não pode ser desfeita.`;
    document.getElementById('modal-confirm').onclick=()=> deleteProperty(id);
    showModal();
}

// Deletar imóvel
async function deleteProperty(id){
    try {
        const res = await fetch('../../../backend/ClienteBackend/excluirImoveis.php',{
            method:'POST',
            body: new URLSearchParams({id})
        });
        const data = await res.json();
        if(data.success){
            showToast('🗑️ Imóvel excluído com sucesso','success');
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

// Validação do formulário
function validateForm(){
    const fields = [
        {id:'nome', message:'Nome do imóvel é obrigatório'},
        {id:'rua', message:'Rua é obrigatória'},
        {id:'bairro', message:'Bairro é obrigatório'},
        {id:'cidade', message:'Cidade é obrigatória'},
        {id:'estado', message:'Estado é obrigatório'},
        {id:'regiao', message:'Região é obrigatória'},
        {id:'consumo', message:'Consumo mensal é obrigatório'}
    ];

    let isValid = true;

    fields.forEach(f => clearFieldError(f.id));

    fields.forEach(f=>{
        const val = document.getElementById(f.id).value.trim();
        if(!val || (f.id==='consumo' && (isNaN(val) || parseInt(val)<=0))){
            showFieldError(f.id,f.message);
            isValid=false;
        }
    });

    const consumo = parseInt(document.getElementById('consumo').value);
    if(consumo && consumo>10000){
        showFieldError('consumo','Consumo muito alto. Verifique o valor inserido.');
        isValid=false;
    }

    return isValid;
}

function showFieldError(fieldId,message){
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error-${fieldId}`);
    field.classList.add('error');
    errorElement.textContent = message;
}

function clearFieldError(fieldId){
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error-${fieldId}`);
    field.classList.remove('error');
    errorElement.textContent='';
}

// Auto-select região
function updateRegionByState(){
    const estado = document.getElementById('estado').value;
    const regiao = document.getElementById('regiao');

    const regioesPorEstado = {
        'AC':'Norte','AM':'Norte','AP':'Norte','PA':'Norte','RO':'Norte','RR':'Norte','TO':'Norte',
        'AL':'Nordeste','BA':'Nordeste','CE':'Nordeste','MA':'Nordeste','PB':'Nordeste','PE':'Nordeste','PI':'Nordeste','RN':'Nordeste','SE':'Nordeste',
        'GO':'Centro-Oeste','MT':'Centro-Oeste','MS':'Centro-Oeste','DF':'Centro-Oeste',
        'ES':'Sudeste','MG':'Sudeste','RJ':'Sudeste','SP':'Sudeste',
        'PR':'Sul','RS':'Sul','SC':'Sul'
    };

    if(regioesPorEstado[estado]) regiao.value = regioesPorEstado[estado];
}

// Toast e modal
function showToast(message,type='success'){
    toast.textContent=message;
    toast.className=`toast ${type}`;
    toast.classList.add('show');
    setTimeout(()=>{toast.classList.remove('show');},4000);
}

function showModal(){
    modal.classList.add('show');
    document.body.style.overflow='hidden';
}

function hideModal(){
    modal.classList.remove('show');
    document.body.style.overflow='auto';
}

// Botão loading
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

// Atualizar estado da navegação
function updateNavigationState(){
    const navOrcamentos = document.getElementById('nav-orcamentos');

    if(properties.length===0){
        navOrcamentos.style.opacity='0.6';
        btnSolicitarOrcamento.style.opacity='0.6';
    } else {
        navOrcamentos.style.opacity='1';
        btnSolicitarOrcamento.style.opacity='1';
    }
}
