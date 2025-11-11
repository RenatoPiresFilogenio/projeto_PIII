
function formatarValorBR(valor) {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch (e) { return 'N/A'; }
}

function exibirNotificacao(mensagem, tipo) {
    const container = document.getElementById('notification-area');
    if (!container) return;
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`; 
    notification.textContent = mensagem;
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}
function checarNotificacoesUrl(id) {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const status = urlParams.get('status');
    if (error) exibirNotificacao('Erro: ' + error, 'error');
    if (status) exibirNotificacao('Ação concluída com sucesso!', 'success');
    if (error || status) {
        window.history.replaceState({}, document.title, window.location.pathname + `?id=${id}`);
    }
}


let todosOsProdutos = []; 

async function carregarSelectsIniciais() {
    const selectFornecedor = document.getElementById('fornecedor_kit_id');
    const selectProduto = document.getElementById('produtos_list_kit_id');
    
    try {
        const resFornecedores = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php");
        const fornecedores = await resFornecedores.json();
        if (fornecedores && fornecedores.length > 0) {
            selectFornecedor.innerHTML = '<option value="">Selecione um Fornecedor</option>';
            selectFornecedor.innerHTML += fornecedores.map(f => `<option value="${f.id_fornecedor}">${f.nome}</option>`).join('');
        }

        const resProdutos = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");
        const dataProdutos = await resProdutos.json();
        if (dataProdutos.status === 'success' && dataProdutos.produtos.length > 0) {
            todosOsProdutos = dataProdutos.produtos; 
            selectProduto.innerHTML = '<option value="">Selecione um Produto</option>';
            selectProduto.innerHTML += todosOsProdutos.map(p => `<option value="${p.id_produto}">${p.nome} (${p.modelo})</option>`).join('');
        }
    } catch (e) {
        console.error("Erro ao carregar selects:", e);
        exibirNotificacao("Erro ao carregar dados de fornecedores/produtos.", 'error');
    }
}

function adicionarProdutoNaLista(produtoId, quantidade = 1, valor = 0.00) {
    const listaUL = document.getElementById('lista_produto');
    const produto = todosOsProdutos.find(p => p.id_produto == produtoId);
    
    if (!produto) {
        alert("Produto não encontrado na lista.");
        return;
    }

    // Verifica se já existe
    if (listaUL.querySelector(`input[name="produto_ids[]"][value="${produtoId}"]`)) {
        alert("Este produto já foi adicionado ao kit.");
        return;
    }
    
    const li = document.createElement('li');
    li.className = 'list_produto_item';
    const inputIdQtd = `qtd_prod_${produtoId}`;
    const inputIdVal = `val_prod_${produtoId}`;
    const valorFormatado = formatarValorBR(valor);

    li.innerHTML = `
        <span><strong>${produto.nome}</strong> (${produto.modelo})</span>
        <div class="controles-produto"> 
            <input type="hidden" name="produto_ids[]" value="${produtoId}">
            <div class="controle-item">
                <label for="${inputIdQtd}">Qtd *</label>
                <input type="number" class="input_number" name="quantidades[]" id="${inputIdQtd}" value="${quantidade}" min="1" required>
            </div>
            <div class="controle-item">
                <label for="${inputIdVal}">Valor Unit. *</label>
                <input type="text" class="input_valor" name="valores_unitarios[]" id="${inputIdVal}" value="${valorFormatado}" placeholder="0,00" required>
            </div>
            <button type="button" class="btn-remover" aria-label="Remover ${produto.nome}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    listaUL.appendChild(li);
}


function KitView(kit, fornecedorNome) {
    const container = document.getElementById('kit_view');
    
    let produtosHTML = '<li>Nenhum produto neste kit.</li>';
    if (kit.produtos && kit.produtos.length > 0) {
        produtosHTML = kit.produtos.map(p => 
            `<li class="card-kit-produto-item">${p.quantidade}x ${p.nome_produto} (${p.modelo_produto})</li>`
        ).join('');
    }

    const htmlDoKit = `
        <div class="card-kit-preview" id="kit-preview-${kit.id_kit}">
            <h3 class="card-kit-titulo">Kit: <strong>${kit.descricao}</strong></h3>
            <p class="card-kit-info">Fornecedor: <strong>${fornecedorNome}</strong></p>
            <p class="card-kit-info">Data de Cadastro: ${formatarData(kit.data_cadastro)}</p>
            <hr>
            <h4 class="card-kit-titulo" style="font-size: 1.1rem; margin-bottom: 10px;">Produtos Inclusos</h4>
            <ul class="card-kit-produtos-lista">
                ${produtosHTML}
            </ul>
        </div>
    `;
    container.innerHTML = htmlDoKit;
}


document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const idDoKit = urlParams.get('id');

    const form = document.getElementById('form-editar-kit');
    const btnExcluir = document.getElementById('btn-excluir');
    const btnAddProduto = document.getElementById('btn-add-produto');
    const listaUL = document.getElementById('lista_produto');
    
    if (!idDoKit) {
        exibirNotificacao("ID do kit não encontrado na URL.", 'error');
        document.querySelector('.form-container').innerHTML = "<h3>ID do kit não especificado.</h3>";
        return;
    }
    
    checarNotificacoesUrl(idDoKit);
    await carregarSelectsIniciais(); 

    try {
        const res = await fetch(`../../../../backend/Admin/Kits/ListarKitPorID.php?id=${idDoKit}`);
        if (!res.ok) throw new Error("Falha ao buscar dados do kit.");
        
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || "Erro ao carregar kit.");
        
        const kit = data.kit;

        document.getElementById('kit_id').value = kit.id_kit;
        document.getElementById('descricao_kit').value = kit.descricao;
        
        const selectFornecedor = document.getElementById('fornecedor_kit_id');
        if (kit.produtos && kit.produtos.length > 0) {
            const idFornecedor = kit.produtos[0].fk_fornecedor_id; 
            selectFornecedor.value = idFornecedor;
        }

        listaUL.innerHTML = '';
        kit.produtos.forEach(p => {
            adicionarProdutoNaLista(p.fk_produto_id, p.quantidade, p.valor_unitario);
        });

        const fornecedorNome = selectFornecedor.options[selectFornecedor.selectedIndex].text;
        KitView(kit, fornecedorNome);
        
        document.getElementById('titulo_kit').textContent = `Editar Kit: ${kit.descricao}`;

    } catch (e) {
        console.error("Erro ao carregar kit:", e);
        exibirNotificacao(e.message, 'error');
    }

    btnAddProduto.addEventListener('click', () => {
        const selectProduto = document.getElementById('produtos_list_kit_id');
        const produtoId = selectProduto.value;
        if (produtoId) {
            adicionarProdutoNaLista(produtoId, 1, 0.00); 
            selectProduto.selectedIndex = 0; 
        } else {
            alert("Por favor, selecione um produto.");
        }
    });

    listaUL.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.btn-remover');
        if (removeButton) {
            removeButton.closest('li.list_produto_item').remove();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (listaUL.children.length === 0) {
             exibirNotificacao("O kit deve conter pelo menos um produto.", 'error');
             return;
        }

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
              
            } else {
                throw new Error(data.message || 'Erro desconhecido ao salvar.');
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

    btnExcluir.addEventListener('click', async () => {
        const id = document.getElementById('kit_id').value;
        const nome = document.getElementById('descricao_kit').value;

        if (!confirm(`Tem certeza que deseja excluir o kit "${nome}"?`)) {
            return;
        }

        const urlDelete = `../../../../backend/Admin/Kits/EditarKit.php?action=delete&id=${id}`;

        try {
            const response = await fetch(urlDelete, { method: 'GET' });
            const data = await response.json();

            if (response.ok && data.success) {
                alert(data.message);
                window.location.href = `../../Admin/cadastro_fornecedores/cadastroFornecedores.html?status=deleted_ok&tab=kits`;
            } else {
                exibirNotificacao(data.message, 'error');
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            exibirNotificacao(error.message, 'error');
        }
    });
});