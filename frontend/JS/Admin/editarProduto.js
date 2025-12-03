document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const idDoProduto = urlParams.get('id');
    const form = document.getElementById('form-editar-produto');
    const btnExcluir = document.getElementById('btn-excluir');
    const btnFechar = document.getElementById('btn-fechar');
    const selectMarca = document.getElementById('id_marca');

    if (!idDoProduto) {
        exibirNotificacao("Erro: ID do produto não encontrado na URL.", 'error');
        document.querySelector('.form-container').innerHTML = "<h3>ID do produto não especificado.</h3>";
        return;
    }

    try {
        const marcasResponse = await fetch('../../../../backend/Admin/Marcas/ListarMarcas.php');
        const dataMarcas = await marcasResponse.json();
        if (dataMarcas.marcas) {
            const optionsHtml = dataMarcas.marcas.map(m => 
                `<option value="${m.id_marca}">${m.nome}</option>`
            ).join('');
            selectMarca.innerHTML = '<option value="">Selecione uma marca</option>' + optionsHtml;
        }
    } catch (e) {
        console.error("Falha ao carregar marcas", e);
        selectMarca.innerHTML = '<option value="">Falha ao carregar marcas</option>';
    }

    const urlFetch = `../../../../backend/Admin/CadastrarProduto/ListarProdutoPorID.php?id_produto=${idDoProduto}`;

    try {
        const produto_response = await fetch(urlFetch);
        if (!produto_response.ok) throw new Error(`Erro de rede: ${produto_response.status}`);
        
        const responseData = await produto_response.json();
        if (responseData.status === 'error') throw new Error(`Erro da API: ${responseData.message}`);
        
        const produto = responseData.produto;
        if (!produto) throw new Error("Produto não encontrado.");

        document.getElementById("nome_produto").value = produto.nome;
        document.getElementById("Modelo").value = produto.modelo;
        document.getElementById("valor_unitario").value = produto.valor_unitario;
        document.getElementById("potencia_kwh").value = produto.potencia_kwh;
        document.getElementById("tipo_produto").value = produto.tipo_produto;
        document.getElementById("id_marca").value = produto.fk_marcas_id_marca; 
        document.getElementById("id_produto").value = produto.id_produto;
        document.getElementById("titulo_marca").textContent = `Editar Produto: ${produto.nome}`;

        ProdutoView(produto);

    } catch (error) {
        console.error("Erro no processamento do produto:", error);
        exibirNotificacao(`Falha ao carregar dados: ${error.message}`, 'error');
        document.querySelector('.form-container').innerHTML = `<h3>Falha ao carregar dados.</h3>`;
    }

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
                // SUCESSO!
                exibirNotificacao(data.message, 'success');
                ProdutoView(data.produto); 
                document.getElementById("titulo_marca").textContent = `Editar Produto: ${data.produto.nome}`;
            } else {
                throw new Error(data.message || 'Erro desconhecido ao salvar.');
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

    btnExcluir.addEventListener('click', async () => {
        const id = document.getElementById('id_produto').value;
        const nome = document.getElementById('nome_produto').value;

        if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        const urlDelete = `../../../../backend/Admin/CadastrarProduto/EditarProduto.php?action=delete&id=${id}`;

        try {
            const response = await fetch(urlDelete, { method: 'GET' });
            const data = await response.json();

            if (response.ok && data.success) {
                alert(data.message);
                window.location.href = `../../Admin/cadastro_fornecedores/cadastroFornecedores.html?status=deleted_ok&tab=placas`;
            } else {
                if (data.error === 'in_use') {
                    exibirNotificacao(data.message, 'error');
                } else {
                    throw new Error(data.message || 'Erro desconhecido ao excluir.');
                }
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

    btnFechar.addEventListener('click', () => {
        window.location.href = '../../Admin/cadastro_fornecedores/cadastroFornecedores.html?tab=placas';
    });
});

/**
 * Renderiza o painel de visualização do produto (Estilo Padronizado)
 */
function ProdutoView(dados) {
    const container = document.getElementById('produto_view');
    if (!container) return;

    if (!dados || typeof dados !== 'object') {
        container.innerHTML = "<p>Erro ao carregar visualização.</p>";
        return;
    }

    const nomeProduto = dados.nome || 'Produto';
    const modelo = dados.modelo || '-';
    const nomeMarca = dados.nome_marca || '-';
    const pais = dados.pais_origem || '-';
    const data = formatarData(dados.data_cadastro);
    
    // Link do site da marca
    let linkSite = dados.site_oficial || '#';
    let displaySite = 'Site Oficial da Marca';
    
    if (linkSite !== '#' && linkSite.trim() !== '') {
        if (!linkSite.startsWith('http')) {
            linkSite = 'https://' + linkSite;
        }
    } else {
        linkSite = '#';
        displaySite = 'Site da marca não informado';
    }
    
    // HTML Estruturado igual ao de Marca/Fornecedor
    const htmlPainel = `
        <div class="info-panel">
            <h3>Produto: ${nomeProduto}</h3>
            
            <div class="info-panel-row">
                <strong>Modelo:</strong> ${modelo}
            </div>

            <div style="margin: 20px 0; border-top: 1px dashed #ccc; padding-top: 15px;">
                <h4 style="color: #0056b3; margin-bottom: 10px;">Dados da Marca</h4>
                
                <div class="info-panel-row">
                    <strong>Marca:</strong> ${nomeMarca}
                </div>
                
                <div class="info-panel-row">
                    <strong>País de Origem:</strong> ${pais}
                </div>
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

// Listeners para atualização em tempo real
document.getElementById('nome_produto').addEventListener('input', (e) => {
    const tituloPrincipal = document.getElementById('titulo_marca');
    const tituloPainel = document.querySelector('.info-panel h3');
    
    if(tituloPrincipal) tituloPrincipal.innerHTML = `<i class="fas fa-edit"></i> Editar Produto: ${e.target.value}`;
    if(tituloPainel) tituloPainel.textContent = `Produto: ${e.target.value}`;
});

// Listener para atualizar o nome da marca no painel quando mudar o select
document.getElementById('id_marca').addEventListener('change', (e) => {
    const textoMarca = e.target.options[e.target.selectedIndex].text;
    // Tenta encontrar o campo no painel para atualizar visualmente
    // (Isso é um bonus visual, o ideal é recarregar os dados da marca, mas assim já ajuda)
    // O ideal seria fazer um fetch da marca nova, mas por simplicidade:
    const rows = document.querySelectorAll('.info-panel-row');
    rows.forEach(row => {
        if(row.innerHTML.includes('<strong>Marca:</strong>')) {
            row.innerHTML = `<strong>Marca:</strong> ${textoMarca}`;
        }
    });
});
// Listener para atualizar o nome da marca no painel quando mudar o select
document.getElementById('id_marca').addEventListener('change', (e) => {
    const textoMarca = e.target.options[e.target.selectedIndex].text;
  
    const rows = document.querySelectorAll('.info-panel-row');
    rows.forEach(row => {
        if(row.innerHTML.includes('<strong>Marca:</strong>')) {
            row.innerHTML = `<strong>Marca:</strong> ${textoMarca}`;
        }
    });
});

/**
 * Funções de Notificação e Helpers
 */
function checarNotificacoesUrl(id) {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const status = urlParams.get('status');

    if (error) {
        let mensagem = 'Ocorreu um erro desconhecido.';
        if (error === 'in_use') {
            mensagem = 'ERRO: Este produto está sendo usado e não pode ser excluído!';
        } else if (error === 'campos_vazios') {
            mensagem = 'ERRO: Preencha todos os campos obrigatórios.';
        }
        exibirNotificacao(mensagem, 'error');
    }

    if (status === 'sucesso' || status === '1') {
        exibirNotificacao('Produto atualizado com sucesso!', 'success');
    }

    if (error || status) {
        window.history.replaceState({}, document.title, window.location.pathname + `?id=${id}`);
    }
}

function exibirNotificacao(mensagem, tipo) {
    const container = document.getElementById('notification-area');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'notification-area';
        document.body.appendChild(newContainer);
        container = newContainer;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`; 
    notification.textContent = mensagem;
    
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'N/A';
    }
}