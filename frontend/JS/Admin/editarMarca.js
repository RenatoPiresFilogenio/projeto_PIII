document.addEventListener('DOMContentLoaded', async () => {
    
    // Pega o ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idDaMarca = urlParams.get('id');
    
    // Checa por notificações de *redirecionamento* (ex: após excluir)
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
        if (!response.ok) {
            throw new Error('Falha ao carregar dados da marca.');
        }
        const marca = await response.json();

        if (marca.error) {
             throw new Error(marca.error);
        }

        // Preenche o formulário
        nomeInput.value = marca.nome;
        document.getElementById("Modelo").value = marca.modelo;
        document.getElementById("site_oficial").value = marca.site_oficial;
        document.getElementById("pais_origem").value = marca.pais_origem;
        document.getElementById("titulo_marca").textContent = `Editar Marca: ${marca.nome}`;
        idInput.value = marca.id_marca;

        // Preenche o card de visualização
        const dadosParaView = {
            'id_marca': marca.id_marca,
            'nome': marca.nome,
            'modelo': marca.modelo,
            'site': marca.site_oficial,
            'pais': marca.pais_origem,
            'data_cadastro': marca.data_cadastro
        };
        await MarcaView(dadosParaView);

    } catch (error) {
        console.error("Erro ao carregar marca:", error);
        exibirNotificacao(error.message, 'error');
        form.innerHTML = '<h3>Erro ao carregar dados.</h3>';
    }

    // --- 2. INTERCEPTAR AÇÃO DE SALVAR (POST) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const formData = new FormData(form);
        const urlPost = form.action; // Pega a URL do action do form

        try {
            const response = await fetch(urlPost, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // SUCESSO!
                exibirNotificacao(data.message, 'success');
                
                // Atualiza o card de visualização com os novos dados
                const marcaAtualizada = {
                    'id_marca': data.marca.id_marca,
                    'nome': data.marca.nome,
                    'modelo': data.marca.modelo,
                    'site': data.marca.site_oficial,
                    'pais': data.marca.pais_origem,
                    // Mantém a data de cadastro original
                    'data_cadastro': document.getElementById('Marca_view').querySelector('.card-marca-info[data-key="data"]').textContent 
                };
                await MarcaView(marcaAtualizada);
                
                // Atualiza o título
                document.getElementById("titulo_marca").textContent = `Editar Marca: ${data.marca.nome}`;

            } else {
                // ERRO TRATADO PELO PHP
                throw new Error(data.message || 'Erro desconhecido ao salvar.');
            }
        } catch (error) {
            // ERRO DE REDE
            console.error("Erro ao salvar:", error);
            exibirNotificacao(error.message, 'error');
        }
    });

    // --- 3. INTERCEPTAR AÇÃO DE EXCLUIR (GET) ---
    btnExcluir.addEventListener('click', async () => {
        const id = idInput.value;
        const nome = nomeInput.value;
        
        if (!confirm(`Tem certeza que deseja excluir a marca "${nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }
        
        // Define a URL da API (do seu PHP)
        const urlDelete = `../../../../backend/Admin/Marcas/EditarMarca.php?action=delete&id=${id}`;

        try {
            const response = await fetch(urlDelete, { method: 'GET' });
            const data = await response.json();

            if (response.ok && data.success) {
                // SUCESSO NA EXCLUSÃO
                alert(data.message);
                // Redireciona para a lista
                window.location.href = `../../Admin/cadastro_fornecedores/cadastroFornecedores.html?status=deleted_ok`;
            
            } else {
                // ERRO TRATADO (ex: marca em uso)
                if (data.error === 'in_use') {
                    exibirNotificacao('ERRO: Esta marca está sendo usada por um produto e não pode ser excluída!', 'error');
                } else {
                    throw new Error(data.message || 'Erro desconhecido ao excluir.');
                }
            }
        } catch (error) {
            // ERRO DE REDE
            console.error("Erro ao excluir:", error);
            exibirNotificacao(error.message, 'error');
        }
    });
});

/**
 * Renderiza o card de visualização da marca
 */
function MarcaView(marca) {
    const container = document.getElementById('Marca_view');
    if (!container) return;

    if (!marca || typeof marca !== 'object') {
        container.innerHTML = "<p>Erro ao carregar dados.</p>";
        return;
    }
    
    // Usei o seu HTML e adicionei data-key para fácil atualização
    const htmlDaMarca = `
       <div class="card-marca" id="marca-${marca.id_marca}">
            <h3 class="card-marca-titulo">${marca.nome || 'Marca'}</h3>
            <p class="card-marca-info" data-key="modelo">Modelo: ${marca.modelo || 'N/D'}</p>
            <p class="card-marca-info" data-key="pais">País: ${marca.pais || 'N/D'}</p>
            <p class="card-marca-info" data-key="data">Data: ${formatarData(marca.data_cadastro)}</p>
            <a href="${marca.site || '#'}" target="_blank" class="card-marca-link">Site Oficial</a>
        </div>
    `;
    container.innerHTML = htmlDaMarca;
}

/**
 * Checa a URL por parâmetros de notificação (usado em redirecionamentos)
 */
function checarNotificacoesUrl(id) {
    const urlParams = new URLSearchParams(window.location.search);
    
    const error = urlParams.get('error');
    const status = urlParams.get('status');

    if (error) {
        let mensagem = 'Ocorreu um erro desconhecido.';
        if (error === 'in_use') {
            mensagem = 'ERRO: Esta marca está sendo usada por um produto e não pode ser excluída!';
        }
        exibirNotificacao(mensagem, 'error');
    }

    if (status) {
        let mensagem = '';
        if (status === 'updated_ok') {
            mensagem = 'Marca atualizada com sucesso!';
        }
        exibirNotificacao(mensagem, 'success');
    }

    // Limpa a URL para evitar notificações repetidas no F5
    if (error || status) {
        const novoId = id || urlParams.get('id'); // Garante que o ID permaneça
        window.history.replaceState({}, document.title, window.location.pathname + `?id=${novoId}`);
    }
}

/**
 * Exibe a notificação na tela
 */
function exibirNotificacao(mensagem, tipo) {
    const container = document.getElementById('notification-area');
    // Se a área não existir no HTML, cria uma
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

    // Adiciona classe 'show' para animação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500); // Espera a animação de fade-out
    }, 5000);
}

// Adicionei a função formatarData que estava faltando
function formatarData(dataString) {
    if (!dataString) return 'N/D';
    try {
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}