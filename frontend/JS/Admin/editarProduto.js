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

async function ProdutoView(dados) {
    const container = document.getElementById('produto_view');
    if (!container) return;

    if (!dados || typeof dados !== 'object') {
        container.innerHTML = "<p>Erro ao carregar visualização.</p>";
        return;
    }

    const nomeProduto = dados.nome || 'Produto';
    const modelo = dados.modelo || 'N/D';
    const nomeMarca = dados.nome_marca || 'N/D';
    const pais = dados.pais_origem || 'N/D';
    const data = formatarData(dados.data_cadastro);
    const site = dados.site_oficial || '#';
    
    const htmlDoProduto = `
       <div class="card-marca" id="produto-${dados.id_produto || ''}">
            <h3 class="card-marca-titulo">Produto: <strong>${nomeProduto}</strong></h3>
            <p class="card-marca-info">Modelo: ${modelo}</p>
            <hr>
            <h4 class="card-marca-titulo">Marca: ${nomeMarca}</h4>
            <p class="card-marca-info">País de Origem: ${pais}</p>
            <p class="card-marca-info">Data de Cadastro (Marca): ${data}</p>
            <a href="https://${site.replace(/^https?:\/\//,'')}" target="_blank" class="card-marca-link">Site Oficial da Marca</a>
       </div>
    `;
    container.innerHTML = htmlDoProduto;
}

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