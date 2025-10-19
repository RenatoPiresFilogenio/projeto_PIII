// =========================
// MODAIS (REFATORADO)
// =========================

// Obtém a referência para os elementos do modal uma única vez
const modalFornecedor = document.getElementById("modalFornecedor");
const modalProduto = document.getElementById("modalProduto");
const modalMarca = document.getElementById("modalMarca");
const modalFornecedorEditar = document.getElementById('modalFornecedorEditar');

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

// --- fechar modal
function fecharModalFornecedor() { fecharModal(modalFornecedor); }
function fecharModalProduto() { fecharModal(modalProduto); }
function fecharModalMarca() { fecharModal(modalMarca); }

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

// =========================
// CARREGAR PRODUTOS
// =========================
async function carregarProdutos() {
    const container = document.getElementById("produtosList");
    container.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");
        const responseData = await response.json();
        const produtos = responseData.produtos;

        if (!produtos || produtos.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum produto cadastrado</h3></div>`;
            return;
        }

        container.innerHTML = produtos.map(p => `
            <div class="fornecedor-card">
                <h2>☀️ ${p.nome}</h2>
                <div class="details">
                    <p><strong>Modelo:</strong> ${p.modelo}</p>
                    <p><strong>Tipo:</strong> ${p.tipo_produto}</p>
                </div>
                <hr>
                <div class="details">
                    <h3>Informações da Marca</h3>
                    <p><strong>Marca:</strong> ${p.nome_marca}</p>
                    <p><strong>Série/Modelo:</strong> ${p.modelo_marca}</p>
                    <p><strong>País de Origem:</strong> ${p.pais_origem}</p>
                </div>
                <a href="${p.site_oficial}" target="_blank" class="brand-link">
                    Visitar Site Oficial
                </a>

                <div>
                    <button class="btn-success " onclick="abrirModalFornecedorEditar()">Editar</button>
                    <button class="btn-danger " onclick="ExcluirFornecedor(${p.id_produto})">Excluir</button>
                </div>

            </div>`).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar produtos</h3></div>`;
        console.error("Erro ao carregar produtos:", error);
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
                        <button class="btn-success " onclick="abrirModalFornecedorEditar(${m.id_marca})">Editar</button>
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