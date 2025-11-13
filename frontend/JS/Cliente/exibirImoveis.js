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
        showToast('Redirecionando para página de orçamentos...', 'success');
        setTimeout(() => {
            window.location.href = 'Orcamentos.php';
        }, 1500);
    });

    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if(e.target===modal) hideModal();
    });

    document.getElementById('nav-orcamentos').addEventListener('click', (e)=>{
        e.preventDefault();
        if(properties.length===0){
            showToast('Cadastre pelo menos um imóvel antes de acessar orçamentos','error');
            return;
        }
        showToast('Redirecionando para orçamentos...','success');
        setTimeout(()=>{window.location.href='Orcamentos.php';},1500);
    });

    document.getElementById('regiao').addEventListener('change', filtrarEstadosPorRegiao);

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
        const res = await fetch('../../../backend/ClienteBackEnd/listaimoveis.php?_cache=' + new Date().getTime());
        const data = await res.json();
        
        if(data.error) {
             console.error("Erro vindo do backend:", data.error);
             properties = [];
        } else {
             properties = data;
        }
        
        renderProperties();
    } catch(e){
        console.error("Erro ao buscar imóveis (fetch):", e);
        showToast('Erro ao carregar imóveis','error');
        properties = [];
        renderProperties();
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
            showToast(editingId ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!','success');
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
    <div class="property-card" id="imovel-${p.id}">
        <div class="property-header">
            <div>
                <div class="property-title"><i class="fas fa-home"></i> ${p.nome || '-'}</div>
                <div class="property-address">
                    ${p.rua || '-'}, ${p.numero || '-'} - ${p.bairro || '-'}, ${p.cidade || '-'} / ${p.estado || '-'} - CEP: ${p.cep || '-'}
                </div>
            </div>
            <div class="property-actions">
                <button class="btn btn-primary btn-icon" onclick="editProperty('${p.id}')" title="Editar">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="confirmDeleteProperty('${p.id}')" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div class="property-info">
            <div class="info-item">
                <span class="info-icon"><i class="fas fa-map-marker-alt"></i></span>
                <div>
                    <div class="info-label">Região</div>
                    <div class="info-value">${p.regiao || 'Não informado'}</div>
                </div>
            </div>
            <div class="info-item">
                <span class="info-icon"><i class="fas fa-bolt"></i></span>
                <div>
                    <div class="info-label">Consumo Mensal</div>
                    <div class="info-value">${p.consumo || '-'} kWh</div> 
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
    document.getElementById('numero').value = property.numero;
    document.getElementById('bairro').value = property.bairro;
    document.getElementById('cidade').value = property.cidade;
    document.getElementById('cep').value = property.cep;
    document.getElementById('regiao').value = property.regiao || '';
    
    filtrarEstadosPorRegiao(); 
    document.getElementById('estado').value = property.estado;
    
    document.getElementById('consumo').value = property.consumo || '';

    formTitle.textContent = 'Editar Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Salvar Alterações';
    btnCancel.style.display = 'inline-flex';
    document.querySelectorAll('.error-message').forEach(el=>el.textContent='');
    document.querySelectorAll('.error').forEach(el=>el.classList.remove('error'));
    document.querySelector('.form-section').scrollIntoView({behavior:'smooth'});

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
    formTitle.textContent = 'Cadastrar Novo Imóvel';
    btnSubmit.querySelector('.btn-text').textContent = 'Cadastrar Imóvel';
    btnCancel.style.display = 'none';
    document.querySelectorAll('.error-message').forEach(el=>el.textContent='');
    document.querySelectorAll('.error').forEach(el=>el.classList.remove('error'));
    
    filtrarEstadosPorRegiao();
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
        const res = await fetch('../../../backend/ClienteBackEnd/excluirImoveis.php',{
            method:'POST',
            body: new URLSearchParams({id})
        });
        const data = await res.json();
        if(data.success){
            showToast('Imóvel excluído com sucesso','success');
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
        {id:'numero', message:'Número é obrigatório'},
        {id:'regiao', message:'Região é obrigatória'},
        {id:'estado', message:'Estado é obrigatório'},
        {id:'cidade', message:'Cidade é obrigatória'},
        {id:'bairro', message:'Bairro é obrigatório'},
        {id:'cep', message:'CEP é obrigatório'},
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

// Filtra Estados baseado na Região
function filtrarEstadosPorRegiao() {
    const regiaoSelect = document.getElementById('regiao');
    const estadoSelect = document.getElementById('estado');
    const selectedRegion = regiaoSelect.value;
    
    const currentEstado = estadoSelect.value; 

    estadoSelect.innerHTML = '<option value="">Selecione o estado</option>';

    if (selectedRegion && estadosPorRegiao[selectedRegion]) {
        estadoSelect.disabled = false;
        const states = estadosPorRegiao[selectedRegion];
        
        states.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = estado.nome;
            estadoSelect.appendChild(option);
        });

        // Tenta restaurar a seleção anterior (útil para o 'editProperty')
        if (currentEstado) {
            estadoSelect.value = currentEstado;
        }

    } else {
        estadoSelect.innerHTML = '<option value="">Selecione a região primeiro</option>';
        estadoSelect.disabled = true;
    }
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
    const btnSolicitar = document.getElementById('btn-solicitar-orcamento');

    if(!navOrcamentos || !btnSolicitar) return; 

    if(properties.length===0){
        navOrcamentos.style.opacity='0.6';
        btnSolicitar.style.opacity='0.6';
    } else {
        navOrcamentos.style.opacity='1';
        btnSolicitar.style.opacity='1';
    }
}