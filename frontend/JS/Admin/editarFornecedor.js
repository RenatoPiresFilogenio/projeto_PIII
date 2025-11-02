document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id_fornecedor = urlParams.get('id');

    if (!id_fornecedor) {
        console.error('ID do fornecedor não encontrado na URL.');
        return;
    }

    await listarFornecedorPorId(id_fornecedor);

    if (urlParams.has('sucesso')) {
        alert('Fornecedor atualizado com sucesso!');
        window.history.replaceState({}, document.title, window.location.pathname + "?id=" + id_fornecedor);
    } else if (urlParams.has('erro')) {
        alert('Erro: ' + urlParams.get('erro'));
        window.history.replaceState({}, document.title, window.location.pathname + "?id=" + id_fornecedor);
    }
});

async function listarFornecedorPorId(id_fornecedor) {
    try {
        document.getElementById('id_fornecedor').value = id_fornecedor;

        let responseFornecedor = await fetch(`../../../../backend/Admin/Fornecedor/ListarFornecdorPorID.php?id=${id_fornecedor}`);
        const fornecedor = await responseFornecedor.json();

        if (fornecedor.erro) {
            console.error(fornecedor.erro);
        } else {
            document.getElementById('nome_fornecedor').value = fornecedor.nome;
            document.getElementById('email').value = fornecedor.email;
            document.getElementById('telefone').value = fornecedor.telefone;
            FornecedorView(fornecedor);
        }

        let responseKit = await fetch(`../../../../backend/Admin/Kits/ListarKitPorIDFornecedor.php?id=${id_fornecedor}`);
        const kit = await responseKit.json();

        const selectElement = document.getElementById('kits');

        if (kit.erro) {
            console.error('Erro ao buscar kit:', kit.erro);
            selectElement.innerHTML = `<option value="">${kit.erro}</option>`;
            return;
        }

        selectElement.innerHTML = '';
        const newOption = document.createElement('option');
        newOption.value = kit.id_kit;
        newOption.textContent = `Nome: ${kit.nome} Descrição: ${kit.descricao}`;
        selectElement.appendChild(newOption);
        newOption.selected = true;

    } catch (error) {
        console.error('Falha grave ao buscar dados:', error);
        document.getElementById('kits').innerHTML = `<option value="">Falha ao carregar dados</option>`;
    }
}

function FornecedorView(fornecedor) {
    const container = document.getElementById('Fornecedor_view');

    if (!container) {
        console.error("Erro: Elemento 'Fornecedor_view' não foi encontrado.");
        return;
    }

    if (!fornecedor || typeof fornecedor !== 'object') {
        console.error("Erro: Dados inválidos enviados para FornecedorView.");
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