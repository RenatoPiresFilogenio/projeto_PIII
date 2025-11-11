document.addEventListener('DOMContentLoaded', async () => {
    
    const form = document.getElementById('form-editar-fornecedor');
    const btnExcluir = document.getElementById('btn-excluir');
    const idInput = document.getElementById('id_fornecedor');
    const nomeInput = document.getElementById('nome_fornecedor');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const selectKit = document.getElementById('kits');
    
    const urlParams = new URLSearchParams(window.location.search);
    const id_fornecedor = urlParams.get('id');

    if (!id_fornecedor) {
        exibirNotificacao('ID do fornecedor não encontrado na URL.', 'error');
        return;
    }

    checarNotificacoesUrl(id_fornecedor);

    try {
        const responseFornecedor = await fetch(`../../../../backend/Admin/Fornecedor/ListarFornecdorPorID.php?id=${id_fornecedor}`);
        const fornecedor = await responseFornecedor.json();

        if (fornecedor.erro) {
            throw new Error(fornecedor.erro);
        }
        
        idInput.value = id_fornecedor;
        nomeInput.value = fornecedor.nome;
        emailInput.value = fornecedor.email;
        telefoneInput.value = fornecedor.telefone;
        document.getElementById('titulo_fornecedor').textContent = `Editar Fornecedor: ${fornecedor.nome}`;
        
        FornecedorView(fornecedor);

    } catch (error) {
        console.error('Falha grave ao buscar dados do fornecedor:', error);
        exibirNotificacao(error.message, 'error');
    }

    try {
       
        const responseKits = await fetch(`../../../../backend/Admin/Kits/ListarKits.php`);
        const dataKits = await responseKits.json();

        const responseKitAtual = await fetch(`../../../../backend/Admin/Kits/ListarKitPorIDFornecedor.php?id=${id_fornecedor}`);
        const kitAtualData = await responseKitAtual.json();
        const idKitAtual = kitAtualData.id_kit;

        if (dataKits.status === 'success' && dataKits.produtos.length > 0) {
            const kits = dataKits.produtos;
            selectKit.innerHTML = '<option value="">Selecione um kit</option>'; 
            
            kits.forEach(kit => {
                const newOption = document.createElement('option');
                newOption.value = kit.id_kit;
                newOption.textContent = kit.descricao; 
                
                if (kit.id_kit == idKitAtual) {
                    newOption.selected = true;
                }
                selectKit.appendChild(newOption);
            });
        } else {
             selectKit.innerHTML = `<option value="">Nenhum kit encontrado</option>`;
        }
    } catch (e) {
        console.error("Erro ao carregar kits:", e);
        selectKit.innerHTML = `<option value="">Erro ao carregar kits</option>`;
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
                exibirNotificacao(data.message, 'success');
                FornecedorView(data.fornecedor);
                document.getElementById('titulo_fornecedor').textContent = `Editar Fornecedor: ${data.fornecedor.nome}`;
            } else {
                throw new Error(data.message || 'Erro desconhecido ao salvar.');
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

    btnExcluir.addEventListener('click', async () => {
        const id = idInput.value;
        const nome = nomeInput.value;

        if (!confirm(`Tem certeza que deseja excluir o fornecedor "${nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }
        
        const urlDelete = `../../../../backend/Admin/Fornecedor/EditarFornecedor.php?action=delete&id=${id}`;

        try {
            const response = await fetch(urlDelete, { method: 'GET' });
            const data = await response.json();

            if (response.ok && data.success) {
                alert(data.message);
                window.location.href = `../../Admin/cadastro_fornecedores/cadastroFornecedores.html?status=deleted_ok&tab=fornecedores`;
            } else {
                exibirNotificacao(data.message, 'error');
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

}); 

function FornecedorView(fornecedor) {
    const container = document.getElementById('Fornecedor_view');
    if (!container) return;

    if (!fornecedor || typeof fornecedor !== 'object') {
        container.innerHTML = "<p>Erro ao carregar dados do fornecedor.</p>";
        return;
    }

    const htmlDoFornecedor = `
        <div class="card-fornecedor" id="fornecedor-${fornecedor.id_fornecedor || 0}"> 
            <h3 class="card-fornecedor-titulo">${fornecedor.nome}</h3>
            <p class="card-fornecedor-info">Email: ${fornecedor.email}</p>
            <p class="card-fornecedor-info">Telefone: ${fornecedor.telefone}</p>
        </div>
    `;
    container.innerHTML = htmlDoFornecedor;
}


function checarNotificacoesUrl(id) {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('erro');
    const status = urlParams.get('sucesso');

    if (error) {
        let mensagem = 'Ocorreu um erro desconhecido.';
        if (error === 'campos_vazios') {
            mensagem = 'ERRO: Preencha todos os campos obrigatórios.';
        }
        exibirNotificacao(mensagem, 'error');
    }

    if (status === '1') {
        exibirNotificacao('Fornecedor atualizado com sucesso!', 'success');
    }

    if (error || status) {
        window.history.replaceState({}, document.title, window.location.pathname + `?id=${id}`);
    }
}

function exibirNotificacao(mensagem, tipo) {
    const container = document.getElementById('notification-area');
    if (!container) return;

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

document.getElementById('btn-fechar').addEventListener('click', () => {
            window.location.href = '../../Admin/cadastro_fornecedores/cadastroFornecedores.html?tab=fornecedores';
        });