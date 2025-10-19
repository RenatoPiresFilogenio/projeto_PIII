document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);

    const id_fornecedor = urlParams.get('id');

    await listarFornecedorPorId(id_fornecedor);
    await listarProdutosVinculadosAoFornecedor(id_fornecedor);
});

async function listarFornecedorPorId(id_fornecedor) {
    const response = await fetch(`../../../../backend/Admin/Fornecedor/ListarFornecdorPorID.php?id=${id_fornecedor}`);
    const fornecedor = await response.json();

    document.getElementById('nome_fornecedor').value = fornecedor.nome;
    document.getElementById('email').value = fornecedor.email;
    document.getElementById('telefone').value = fornecedor.telefone;
}

async function listarProdutosVinculadosAoFornecedor(id_fornecedor) {

    const response = await fetch(`../../../../backend/Admin/CadastrarProduto/ListarProdutoPorFornecedor.php?id_fornecedor=${id_fornecedor}`);

    const data = await response.json();
    console.log(data);

    let container = document.getElementById('lista_produtos');

    if (data.status === 'success' && data.produtos && data.produtos.length > 0) {
        container.innerHTML = data.produtos.map(produto => {
            return `
                <li class="produto" id="${produto.id_produto}"> 
                    ${produto.nome}
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
}