document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idDoProduto = urlParams.get('id');

    if (!idDoProduto) {
        console.error("Erro: ID do produto não encontrado na URL.");
        document.getElementById('produto_view').innerHTML = "<p>ID do produto não especificado.</p>";
        return;
    }

    const urlFetch = `../../../../backend/Admin/CadastrarProduto/ListarProdutoPorID.php?id_produto=${idDoProduto}`;

    try {
        const produto_response = await fetch(urlFetch);

        if (!produto_response.ok) {
            throw new Error(`Erro de rede: ${produto_response.status} ${produto_response.statusText}`);
        }

        const responseData = await produto_response.json();

        if (responseData.status === 'error') {
            document.getElementById('produto_view').innerHTML = `<p>Erro: ${responseData.message}</p>`;
            console.error("Erro da API:", responseData.error_details || responseData.message);
            return;
        }

        const produto = responseData.produto;

        if (!produto) {
            document.getElementById('produto_view').innerHTML = "<p>Produto não encontrado.</p>";
            return;
        }


        if (document.getElementById("nome_produto")) {
            document.getElementById("nome_produto").value = produto.nome;
        }
        if (document.getElementById("Modelo")) {
            document.getElementById("Modelo").value = produto.modelo;
        }
        if (document.getElementById("valor_unitario")) {
            document.getElementById("valor_unitario").value = produto.valor_unitario;
        }
        if (document.getElementById("Categoria")) {
            document.getElementById("Categoria").value = produto.tipo_produto;
        }
<<<<<<< HEAD
        if (document.getElementById("id_produto")) {

            document.getElementById("id_produto").value = produto.id_produto;
=======
        if (document.getElementById("id_marca")) {

            document.getElementById("id_marca").value = produto.fk_marcas_id_marca;
>>>>>>> f12ad6a0023d1a7b864faf4e41e9d11e559f1d13
        }

        const dadosView = {
            'id_produto': produto.id_produto,
            'nome': produto.nome,
            'modelo': produto.modelo,
            'titulo': produto.nome_marca,
            'pais': produto.pais_origem,
            'site': produto.site_oficial,
            'data_cadastro': produto.data_cadastro || 'N/A'
        }

        await ProdutoView(dadosView);

    } catch (error) {
        console.error("Erro no processamento do produto:", error);
        document.getElementById('produto_view').innerHTML = `<p>Falha ao carregar os dados. Detalhe: ${error.message}</p>`;
    }
});


async function ProdutoView(dados) {

    const container = document.getElementById('produto_view');
    if (!container) {
        console.error("Erro: Elemento 'produto_view' não foi encontrado.");
        return;
    }

    if (!dados || typeof dados !== 'object') {
        console.error("Erro: Dados inválidos enviados para ProdutoView.");
        container.innerHTML = "<p>Erro ao carregar dados.</p>";
        return;
    }

    const htmlDoProduto = `
       <div class="card-marca" id="produto-${dados.id_produto}">
             <h3 class="card-marca-titulo">Produto: ${dados.nome}</h3>
             <p class="card-marca-info">Modelo: ${dados.modelo}</p>
             <hr>
             <h4 class="card-marca-titulo">Marca: ${dados.titulo}</h4>
             <p class="card-marca-info">País de Origem: ${dados.pais}</p>
             <p class="card-marca-info">Data de Cadastro: ${dados.data_cadastro}</p>
             <a href="${dados.site}" target="_blank" class="card-marca-link">Site Oficial da Marca</a>
       </div>
    `;

    container.innerHTML = htmlDoProduto;

}