document.addEventListener('DOMContentLoaded', async () => {
    
    // Pega o ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idDaMarca = urlParams.get('id');
    
    // Variável para guardar a data original e não perder na edição
    let dataCadastroOriginal = null; 

    // Checa por notificações de redirecionamento
    checarNotificacoesUrl(idDaMarca);

    const form = document.querySelector('.form_editar_fornecedor');
    const btnExcluir = document.getElementById('btn-excluir');
    const idInput = document.getElementById('id_marca');
    const nomeInput = document.getElementById('nome_marca');

    if (!idDaMarca) {
        exibirNotificacao('ID da marca não encontrado.', 'error');
        form.innerHTML = '<h3>Erro ao carregar dados.</h3>';
        return;
    }

    // --- 1. CARREGAR DADOS INICIAIS ---
    try {
        const urlFetch = `../../../../backend/Admin/Marcas/ListarMarcaPorID.php?id_marca=${idDaMarca}`;
        const response = await fetch(urlFetch);
        
        if (!response.ok) throw new Error('Falha ao carregar dados.');
        
        const marca = await response.json();

        if (marca.error) throw new Error(marca.error);

        // Salva a data original na memória
        dataCadastroOriginal = marca.data_cadastro;

        // Preenche o formulário
        nomeInput.value = marca.nome;
        document.getElementById("Modelo").value = marca.modelo;
        document.getElementById("site_oficial").value = marca.site_oficial;
        document.getElementById("pais_origem").value = marca.pais_origem;
        
        // Atualiza título da página
        const titulo = document.getElementById("titulo_marca");
        if(titulo) titulo.textContent = `Editar Marca: ${marca.nome}`;
        
        idInput.value = marca.id_marca;

        // Preenche o Painel Lateral
        MarcaView(marca);

    } catch (error) {
        console.error("Erro ao carregar marca:", error);
        exibirNotificacao(error.message, 'error');
        form.innerHTML = '<h3>Erro ao carregar dados.</h3>';
    }

    // --- 2. SALVAR ALTERAÇÕES (POST) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const urlPost = form.action;

        try {
            const response = await fetch(urlPost, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                
                exibirNotificacao(data.message, 'success');
                
                // Atualiza o card lateral com os dados novos + a data guardada
                const marcaAtualizada = {
                    'id_marca': idInput.value,
                    'nome': document.getElementById('nome_marca').value,
                    'modelo': document.getElementById('Modelo').value,
                    'site': document.getElementById('site_oficial').value,
                    'pais': document.getElementById('pais_origem').value,
                    'data_cadastro': dataCadastroOriginal // Usa a variável guardada
                };
                
                MarcaView(marcaAtualizada);
                
                // Atualiza o título
                const titulo = document.getElementById("titulo_marca");
                if(titulo) titulo.textContent = `Editar Marca: ${marcaAtualizada.nome}`;

            } else {
                throw new Error(data.message || 'Erro desconhecido ao salvar.');
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

    // --- 3. EXCLUIR MARCA (GET) ---
    btnExcluir.addEventListener('click', async () => {
        const nome = nomeInput.value;
        
        if (!confirm(`Tem certeza que deseja excluir a marca "${nome}"?`)) return;
        
        const urlDelete = `../../../../backend/Admin/Marcas/EditarMarca.php?action=delete&id=${idDaMarca}`;

        try {
            const response = await fetch(urlDelete, { method: 'GET' });
            const data = await response.json();

            if (response.ok && data.success) {
                // Redireciona com sucesso
                window.location.href = `../../Admin/cadastro_fornecedores/cadastroFornecedores.html?tab=marcas`;
            } else {
                if (data.error === 'in_use') {
                    exibirNotificacao('ERRO: Marca em uso por produtos!', 'error');
                } else {
                    throw new Error(data.message || 'Erro ao excluir.');
                }
            }
        } catch (error) {
            exibirNotificacao(error.message, 'error');
        }
    });
});

/**
 * Renderiza o painel lateral (Layout Novo)
 */
function MarcaView(marca) {
    const container = document.getElementById('Marca_view');
    if (!container) return;

    if (!marca) return;
    
    // Tratamento de URL
    let linkSite = marca.site || marca.site_oficial || '#';
    let displaySite = 'Site Oficial';
    
    if (linkSite !== '#' && linkSite.trim() !== '') {
        if (!linkSite.startsWith('http')) {
            linkSite = 'https://' + linkSite;
        }
    } else {
        linkSite = '#';
        displaySite = 'Não informado';
    }

    const htmlPainel = `
        <div class="info-panel">
            <h3>Marca: ${marca.nome || 'Nova Marca'}</h3>
            
            <div class="info-panel-row">
                <strong>Modelo:</strong> ${marca.modelo || '-'}
            </div>
            
            <div class="info-panel-row">
                <strong>País de Origem:</strong> ${marca.pais || marca.pais_origem || '-'}
            </div>
            
            <div class="info-panel-row">
                <strong>Data de Cadastro:</strong> ${formatarData(marca.data_cadastro)}
            </div>

            <div style="margin-top: 15px;">
                <a href="${linkSite}" target="_blank" class="info-panel-link" 
                   ${linkSite === '#' ? 'style="color:#aaa; pointer-events:none;"' : ''}>
                   ${displaySite} <i class="fas fa-external-link-alt" style="font-size:0.8rem;"></i>
                </a>
            </div>
        </div>
    `;
    container.innerHTML = htmlPainel;
}

// Funções Utilitárias
function formatarData(dataString) {
    if (!dataString) return 'N/D';
    try {
        // Se vier do banco YYYY-MM-DD
        if(dataString.includes('-')){
            const [ano, mes, dia] = dataString.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        return dataString; // Se já estiver formatada
    } catch (e) {
        return dataString;
    }
}

function checarNotificacoesUrl() {
    // (Mantive vazio ou simples se não usar redirecionamento com msg na URL)
}

function exibirNotificacao(msg, tipo) {
    const area = document.getElementById('notification-area');
    if(!area) return;
    
    const div = document.createElement('div');
    div.className = `notification ${tipo} show`;
    div.textContent = msg;
    area.appendChild(div);
    
    setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 500);
    }, 4000);
}

// Listener de input
document.getElementById('nome_marca').addEventListener('input', (e) => {
    const titulo = document.getElementById('titulo_marca');
    const tituloCard = document.querySelector('.info-panel h3');
    if(titulo) titulo.textContent = `Editar Marca: ${e.target.value}`;
    if(tituloCard) tituloCard.textContent = `Marca: ${e.target.value}`;
});