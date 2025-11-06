// =========================
// MODAIS (REFATORADO)
// =========================

// Obtém a referência para os elementos do modal uma única vez
const modalFornecedor = document.getElementById("modalFornecedor");
const modalProduto = document.getElementById("modalProduto");
const modalMarca = document.getElementById("modalMarca");
const modalFornecedorEditar = document.getElementById('modalFornecedorEditar');
const modalKit = document.getElementById('modalKit')

/**
 * Função genérica para abrir um modal
 * @param {HTMLElement} modalElement - O elemento do modal a ser aberto
 */
function abrirModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = "flex";
    }
}

/**
 * Função genérica para fechar um modal
 * @param {HTMLElement} modalElement 
 */
function fecharModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = "none";
    }
}

// ----- Funções Específicas-----
function abrirModalFornecedor() { abrirModal(modalFornecedor); }
function abrirModalProduto() { abrirModal(modalProduto); }
function abrirModalMarca() { abrirModal(modalMarca); }
function abrirModalKit() { abrirModal(modalKit) }
// --- fechar modal
function fecharModalFornecedor() { fecharModal(modalFornecedor); }
function fecharModalProduto() { fecharModal(modalProduto); }
function fecharModalMarca() { fecharModal(modalMarca); }
function fecharModalKit() { fecharModal(modalKit) }


// ----- FECHAR MODAL AO CLICAR FORA -----
window.addEventListener("click", (event) => {
    if (event.target === modalFornecedor) fecharModal(modalFornecedor);
    if (event.target === modalProduto) fecharModal(modalProduto);
    if (event.target === modalMarca) fecharModal(modalMarca);
});

// =========================
// TROCAR DE ABA
// =========================
function mostrarTab(tab) {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    document.querySelector(`[onclick="mostrarTab('${tab}')"]`).classList.add("active");
    document.getElementById(`tab-${tab}`).classList.add("active");
}

// =========================
// EVENT LISTENER PRINCIPAL (DOMContentLoaded)
// =========================

document.addEventListener('DOMContentLoaded', () => {
    carregarFornecedores();
    carregarProdutos();
    carregarMarcasEPreencherSelect();
    carregarListKits();
    carregarListKitsFornecedor();
    carregarKitsCadastrados();
});

async function carregarKitsCadastrados() {

    const container = document.getElementById("kitList");

    try {

        const responseKits = await fetch("../../../../backend/Admin/Kits/ListarKits.php");
        const data = await responseKits.json();
        const kits = data.produtos;

        if (!kits || kits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum kit cadastrado</h3>
                    <p>Adicione kits clicando em "Novo kit".</p>
                </div>`;
            return;
        }

        container.innerHTML = kits.map(kit => `
            <div class="fornecedor-card">
                <h3>Nome ${kit.descricao}</h3>
                <p><strong>Descrição:</strong> ${kit.descricao}</p>
                    <a class="btn-success" 
                    href="../../../../frontend/dashboards/Admin/editar_kit/editar_kit.html?id=${kit.id_kit}">
                        <button class="btn-success">
                            Editar
                        </button>
                    </a>
                    <button class="btn-danger " onclick="ExcluirFornecedor(${kit.id_kit})">Excluir</button>
                </div>

            </div>`).join("");

    } catch (e) {

    }

}

async function carregarListKitsFornecedor() {
    const list_kits = document.getElementById("kit_id");

    try {
        const responseKitsList = await fetch("../../../../backend/Admin/Kits/ListarKits.php");
        const data = await responseKitsList.json(); 

        if (data.status === "success" && Array.isArray(data.produtos)) {
            list_kits.innerHTML = `
                <option value="">Selecione um kit</option>
            ` + data.produtos.map(kit => `
                <option value="${kit.id_kit}">
                    Kit: ${kit.descricao} - Descrição: ${kit.descricao}
                </option>
            `).join('');
        } else {
            list_kits.innerHTML = '<option value="">Nenhum kit encontrado.</option>';
        }

    } catch (e) {
        console.error("Erro ao carregar ou exibir kits:", e);
        list_kits.innerHTML = '<option value="">Erro ao carregar a lista de kits.</option>';
    }
}


async function carregarListKits() {

    const list_fornecedor = document.getElementById("fornecedor_list_kit_id");
    const list_product = document.getElementById("produtos_list_kit_id");

    list_fornecedor.innerHTML = "<option value=''>Carregando fornecedores...</option>";
    list_fornecedor.disabled = true;
    list_product.innerHTML = "<option value=''>Aguardando...</option>";
    list_product.disabled = true;

    try {
        let responseFornecedor = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php");

        if (!responseFornecedor.ok) {
            throw new Error(`Erro HTTP (Fornecedores): ${responseFornecedor.status} - ${responseFornecedor.statusText}`);
        }

        const fornecedores = await responseFornecedor.json();

        if (!fornecedores || fornecedores.length === 0) {
            list_fornecedor.innerHTML = `<option value="">Nenhum fornecedor encontrado</option>`;
            list_product.innerHTML = `<option value="">Nenhum fornecedor disponível</option>`;
        } else {
            const optionsHTML = fornecedores.map(fornecedor =>
                `<option value="${fornecedor.id_fornecedor}">${fornecedor.nome}</option>`
            );

            list_fornecedor.innerHTML = optionsHTML.join('');
            list_fornecedor.insertAdjacentHTML('afterbegin', `
                <option value="" selected disabled>Selecione um fornecedor</option>
            `);
            list_fornecedor.disabled = false;
        }


        let responseProdutos = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");
        if (!responseProdutos.ok) {
            throw new Error(`Erro HTTP (Produtos): ${responseProdutos.status} - ${responseProdutos.statusText}`);
        }

        const responseData = await responseProdutos.json();


        const produtos = responseData.produtos;

        if (produtos && produtos.length > 0) {

            const optionsHTML_product = produtos.map(produto =>
                `<option value="${produto.id_produto}">${produto.nome}</option>`
            );

            const optionsString_product = optionsHTML_product.join('');

            list_product.innerHTML = optionsString_product;
            list_product.insertAdjacentHTML('afterbegin', `
                <option value="" selected disabled>Selecione um Produto</option>
            `);

            list_product.disabled = false;

        } else {
            list_product.innerHTML = `<option value="">Nenhum produto encontrado</option>`;
        }

    } catch (error) {
        console.error("Falha ao carregar listas:", error);
        list_fornecedor.innerHTML = `<option value="">Falha ao carregar</option>`;
        list_product.innerHTML = `<option value="">Falha ao carregar dados</option>`;
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const list_fornecedor = document.getElementById('fornecedor_list_kit_id');
    const list_product_select = document.getElementById('produtos_list_kit_id');
    const btn_conf_product = document.getElementById('conf_product_list');
    const lista_produto_ul = document.getElementById('lista_produto');
    const formKit = document.getElementById('formKit');


    async function carregarListKits() {
        if (!list_fornecedor || !list_product_select) {
            console.error("Erro fatal: Elementos do formulário não encontrados.");
            return;
        }

        list_fornecedor.innerHTML = "<option value=''>Carregando fornecedores...</option>";
        list_fornecedor.disabled = true;
        list_product_select.innerHTML = "<option value=''>Aguardando...</option>";
        list_product_select.disabled = true;

        try {
            let responseFornecedor = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php");
            if (!responseFornecedor.ok) {
                throw new Error(`Erro HTTP (Fornecedores): ${responseFornecedor.status}`);
            }
            const fornecedores = await responseFornecedor.json();

            if (!fornecedores || fornecedores.length === 0) {
                list_fornecedor.innerHTML = `<option value="">Nenhum fornecedor encontrado</option>`;
                list_product_select.innerHTML = `<option value="">Nenhum fornecedor disponível</option>`;
            } else {
                const optionsHTML = fornecedores.map(fornecedor =>
                    `<option value="${fornecedor.id_fornecedor}">${fornecedor.nome}</option>`
                );
                list_fornecedor.innerHTML = optionsHTML.join('');
                list_fornecedor.insertAdjacentHTML('afterbegin', `
                    <option value="" selected disabled>Selecione um fornecedor</option>
                `);
                list_fornecedor.disabled = false;
            }

            let responseProdutos = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");
            if (!responseProdutos.ok) {
                throw new Error(`Erro HTTP (Produtos): ${responseProdutos.status}`);
            }
            const responseData = await responseProdutos.json();
            const produtos = responseData.produtos;

            if (produtos && produtos.length > 0) {
                const optionsHTML_product = produtos.map(produto =>
                    `<option value="${produto.id_produto}">${produto.nome}</option>`
                );
                list_product_select.innerHTML = optionsHTML_product.join('');
                list_product_select.insertAdjacentHTML('afterbegin', `
                    <option value="" selected disabled>Selecione um Produto</option>
                `);
                list_product_select.disabled = false;
            } else {
                list_product_select.innerHTML = `<option value="">Nenhum produto encontrado</option>`;
            }

        } catch (error) {
            console.error("Falha ao carregar listas:", error);
            list_fornecedor.innerHTML = `<option value="">Falha ao carregar</option>`;
            list_product_select.innerHTML = `<option value="">Falha ao carregar dados</option>`;
        }
    }

    function adicionarProdutoNaLista() {
        const selectedOption = list_product_select.options[list_product_select.selectedIndex];
        const produtoId = selectedOption.value;
        const produtoNome = selectedOption.text;

        if (!produtoId) {
            alert("Por favor, selecione um produto válido.");
            return;
        }

        const jaExiste = lista_produto_ul.querySelector(`input[name="produto_ids[]"][value="${produtoId}"]`);
        if (jaExiste) {
            alert("Este produto já foi adicionado ao kit.");
            return;
        }

        const li = document.createElement('li');
        li.className = 'list_produto_item';
        const inputIdQtd = `qtd_prod_${produtoId}`;
        const inputIdVal = `val_prod_${produtoId}`;

        li.innerHTML = `
            <strong>${produtoNome}</strong>
            
            <div class="controles-produto"> 

                <div class="controle-item">
                    <label for="${inputIdQtd}">Qtd *</label>
                    <input 
                        type="number" 
                        class="input_number" 
                        name="quantidades[]" 
                        id="${inputIdQtd}" 
                        value="1" 
                        min="1" 
                        required>
                </div>

                <div class="controle-item">
                    <label for="${inputIdVal}">Valor Unit. *</label>
                    <input 
                        type="text" 
                        class="input_valor" 
                        name="valores_unitarios[]" 
                        id="${inputIdVal}" 
                        placeholder="0,00" 
                        required>
                </div>

                <input type="hidden" name="produto_ids[]" value="${produtoId}">
            </div>
            <button type="button" class="btn-remover" aria-label="Remover ${produtoNome}">×</button>
        `;

        lista_produto_ul.appendChild(li);
        list_product_select.selectedIndex = 0;
    }


    function gerenciarCliquesLista(event) {
        if (event.target.classList.contains('btn-remover')) {
            event.target.closest('li.list_produto_item').remove();
        }
    }

    carregarListKits();

    btn_conf_product.addEventListener('click', adicionarProdutoNaLista);

    lista_produto_ul.addEventListener('click', gerenciarCliquesLista);

    if (formKit) {
        formKit.addEventListener('submit', function (event) {
            const produtosNaLista = lista_produto_ul.querySelectorAll('li.list_produto_item');
            if (produtosNaLista.length === 0) {
                event.preventDefault(); // Para o envio
                alert("Você deve adicionar pelo menos um produto ao kit antes de salvar.");
            }
        });
    }

});
// =========================
// CARREGAR FORNECEDORES
// =========================
async function carregarFornecedores() {
    const container = document.getElementById("fornecedoresList");
    container.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php");
        const fornecedores = await response.json();

        if (!fornecedores || fornecedores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum fornecedor cadastrado</h3>
                    <p>Adicione fornecedores clicando em "Novo Fornecedor".</p>
                </div>`;
            return;
        }

        container.innerHTML = fornecedores.map(f => `
            <div class="fornecedor-card">
                <h3>🏭 ${f.nome}</h3>
                <p><strong>Email:</strong> ${f.email}</p>
                <p><strong>Telefone:</strong> ${f.telefone}</p>
                <p><strong>Total de vendas:</strong> ${f.total_vendas}</p>
                <div>
                   
                    <a class="btn-success" 
                    href="../../../../frontend/dashboards/Admin/editar_fornecedor/editar_fornecedor.html?id=${f.id_fornecedor}">
                        <button class="btn-success">
                            Editar
                        </button>
                    </a>
                    <button class="btn-danger " onclick="ExcluirFornecedor(${f.id_fornecedor})">Excluir</button>
                </div>

            </div>`).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar fornecedores</h3></div>`;
        console.error("Erro ao carregar fornecedores:", error);
    }
}
/// carregando kit para cadastro de fornecedor


// =========================
// CARREGAR PRODUTOS
// =========================
async function carregarProdutos() {
    const container = document.getElementById("produtosList");
    container.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");

        if (!response.ok) {
            throw new Error(`Erro de servidor: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData.status === 'error') {
            throw new Error(`Erro na API: ${responseData.message}`);
        }

        const produtos = responseData.produtos;

        if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum produto cadastrado</h3></div>`;
            return;
        }

        container.innerHTML = produtos.map(p => `
            <div class="fornecedor-card">
                <h2>☀️ ${p.nome}</h2>
                <div>
                    <button class="btn-success" onclick="abrirModalProdutoEditar(${p.id_produto})">Editar</button>
                    <button class="btn-danger" onclick="ExcluirFornecedor(${p.id_produto})">Excluir</button>
                </div>
            </div>`).join("");

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar produtos.</h3><p>Detalhes: ${error.message}</p></div>`;
    }
}

// =========================
// CARREGAR MARCAS (PARA A LISTA E PARA O SELECT)
// =========================
async function carregarMarcasEPreencherSelect() {
    const listContainer = document.getElementById('marcasList');
    const selectContainer = document.getElementById('id_marca');

    listContainer.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch('../../../../backend/Admin/Marcas/ListarMarcas.php');
        const responseData = await response.json();
        const marcas = responseData.marcas;

        if (!marcas || marcas.length === 0) {
            listContainer.innerHTML = `<div class="empty-state"><h3>Nenhuma marca cadastrada</h3></div>`;
        } else {
            listContainer.innerHTML = marcas.map(m => `
                <div class="fornecedor-card">
                    <h3>Informações da Marca</h3>
                    <p><strong>Marca:</strong> ${m.nome}</p>
                    <p><strong>Pais de origem:</strong> ${m.pais_origem}</p>
                    <p><strong>Site oficial:</strong> ${m.site_oficial}</p>
                    <p><strong>Data de cadastro:</strong> ${m.data_cadastro}</p>

                    <div>
                        <button class="btn-success " onclick="AbrirEditorMarca(${m.id_marca})">Editar</button>
                        <button class="btn-danger " onclick="ExcluirFornecedor(${m.id_marca})">Excluir</button>
                     </div>
                </div>`
            ).join("");
        }

        if (!marcas || marcas.length === 0) {
            selectContainer.innerHTML = `<option value="" disabled>Nenhuma marca cadastrada</option>`;
        } else {
            const optionsHtml = [
                '<option value="" disabled selected>Selecione uma marca</option>'
            ];
            marcas.forEach(m => {
                optionsHtml.push(`<option value="${m.id_marca}" required>${m.nome}</option>`);
            });

            selectContainer.innerHTML = optionsHtml.join("");
        }

    } catch (error) {
        // Mostra o erro em ambos os locais
        listContainer.innerHTML = `<div class="empty-state"><h3>Erro ao carregar marcas</h3></div>`;
        selectContainer.innerHTML = `<option value="" disabled>Erro ao carregar</option>`;
        console.error("Erro ao carregar marcas:", error);
    }
}

function abrirModalFornecedorEditar(id_fornecedor) {
    const urlComId = `../../../dashboards/Admin/editar_fornecedor/editar_fornecedor.html?id=${id_fornecedor}`;
    window.location.href = urlComId;
}

function AbrirEditorMarca(id_marca) {
    const urlComId = `../../../dashboards/Admin/editar_marca/editar_marca.html?id=${id_marca}`;
    window.location.href = urlComId;
}

function abrirModalProdutoEditar(id_produto) {
    const urlComId = `../../../dashboards/Admin/editar_produto/editar_produto.html?id=${id_produto}`;
    window.location.href = urlComId;
}
