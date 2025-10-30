// O "chefe" da página. Gerencia o que carregar e quando.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const id_fornecedor = urlParams.get('id');

        await listarFornecedorPorId(id_fornecedor);
        await listarProdutosVinculadosAoFornecedor(id_fornecedor);
        const idPrimeiraMarca = await listarMarcas();

        if (idPrimeiraMarca) {
            await carregarProdutosPorMarca(idPrimeiraMarca);
        }

        const selectMarca = document.getElementById('list_marca');
        if (selectMarca) {
            selectMarca.addEventListener('change', async (event) => {
                const idMarcaSelecionada = event.target.value;
                await carregarProdutosPorMarca(idMarcaSelecionada);
            });
        }
    } catch (error) {
        console.error("Erro fatal no carregamento da página:", error);
    }
});

async function listarMarcas() {
    let container = document.getElementById('list_marca');
    try {
        const response = await fetch(`../../../../backend/Admin/Marcas/ListarMarcas.php`);
        const data = await response.json();

        if (data.status === 'success' && data.marcas.length > 0) {
            container.innerHTML = data.marcas.map(marca => {
                return `
                    <option class="marcas" value="${marca.id_marca}"> 
                        ${marca.nome}
                    </option>
                `;
            }).join('');

            return data.marcas[0].id_marca;
        } else {
            container.innerHTML = '<option value="">Nenhuma marca</option>';
            return null;
        }
    } catch (error) {
        console.error("Erro ao listar marcas:", error);
        container.innerHTML = '<option value="">Erro ao carregar</option>';
        return null;
    }
}

async function carregarProdutosPorMarca(id_marca) {
    let containerProduto = document.getElementById('list_produto');

    if (!id_marca) {
        containerProduto.innerHTML = '<option value="">Selecione uma marca</option>';
        return;
    }

    try {
        const response = await fetch(`../../../../backend/Admin/CadastrarProduto/ListarProdutoPorMarca.php?id_marca=${id_marca}`);
        const data = await response.json();

        if (data.status === 'success' || data.produtos.length > 0) {
            containerProduto.innerHTML = data.produtos.map(produto => {

                return `
                    <option class="marcas" value="${produto.id_produto}"> 
                        ${produto.nome}
                    </option>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        containerProduto.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}



async function listarFornecedorPorId(id_fornecedor) {
    try {
        const response = await fetch(`../../../../backend/Admin/Fornecedor/ListarFornecdorPorID.php?id=${id_fornecedor}`);
        const fornecedor = await response.json();

        document.getElementById('nome_fornecedor').value = fornecedor.nome;
        document.getElementById('email').value = fornecedor.email;
        document.getElementById('telefone').value = fornecedor.telefone;
    } catch (error) {
        console.error("Erro ao buscar fornecedor:", error);
    }
}

async function listarProdutosVinculadosAoFornecedor(id_fornecedor) {
    let container = document.getElementById('lista_produtos');

    try {
        const response = await fetch(`../../../../backend/Admin/CadastrarProduto/ListarProdutoPorFornecedor.php?id_fornecedor=${id_fornecedor}`);
        const data = await response.json();

        if (data.status === 'success' && data.produtos && data.produtos.length > 0) {
            container.innerHTML = data.produtos.map(produto => {
                return `
                    <li class="produto" id="produto-${produto.id_produto}"> ${produto.nome}
                        
                        <button class="btn_excluir" data-id="${produto.id_produto}">Excluir</button>
                        
                    </li>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="div_sem_produto">
                    <h1>Não há nenhum produto cadastrado nesse fornecedor</h1>
                </div>
            `;
        }
    } catch (error) {
        console.error("Erro ao listar produtos vinculados:", error);
        container.innerHTML = '<h1>Erro ao carregar produtos.</h1>';
    }
}

document.getElementById('lista_produtos').addEventListener('click', async (event) => {

    if (event.target.classList.contains('btn_excluir')) {
        let idDoProduto = event.target.dataset.id;

        console.log(idDoProduto);
    }

});