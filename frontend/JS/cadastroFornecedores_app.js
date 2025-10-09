// ----- MODAIS -----
const modalFornecedor = document.getElementById("modalFornecedor");
const modalProduto = document.getElementById("modalProduto");
const modalMarca = document.getElementById("modalMarca");

// ----- ABRIR MODAIS -----
function abrirModalFornecedor() { modalFornecedor.style.display = "flex"; }
function abrirModalProduto() { modalProduto.style.display = "flex"; }
function abrirModalMarca() { modalMarca.style.display = "flex"; }

// ----- FECHAR MODAIS -----
function fecharModalFornecedor() { modalFornecedor.style.display = "none"; }
function fecharModalProduto() { modalProduto.style.display = "none"; }
function fecharModalMarca() { modalMarca.style.display = "none"; }

// ----- FECHAR MODAL AO CLICAR FORA -----
window.addEventListener("click", (event) => {
    if (event.target === modalFornecedor) fecharModalFornecedor();
    if (event.target === modalProduto) fecharModalProduto();
    if (event.target === modalMarca) fecharModalMarca();
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
// CARREGAR FORNECEDORES
// =========================
async function carregarFornecedores() {
    const container = document.getElementById("fornecedoresList");
    container.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch("/PI_2025_2222/backend/Admin/CadastrarFornecedor/ListarFornecedor.php");
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
            </div>`).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar fornecedores</h3></div>`;
        console.error(error);
    }
}

// =========================
// CARREGAR PRODUTOS
// =========================
async function carregarProdutos() {
    const container = document.getElementById("produtosList");
    container.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch("/PI_2025_2222/backend/Admin/CadastrarProduto/ListarProduto.php");
        const produtos = await response.json();

        if (!produtos || produtos.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum produto cadastrado</h3></div>`;
            return;
        }

        container.innerHTML = produtos.map(p => `
            <div class="produto-card">
                <h3>📦 ${p.nome}</h3>
                <p><strong>Modelo:</strong> ${p.modelo}</p>
                <p><strong>Valor Unitário:</strong> R$ ${p.valor_unitario}</p>
                <p><strong>Tipo:</strong> ${p.tipo_produto}</p>
                <p><strong>Marca:</strong> ${p.marca_nome}</p>
            </div>`).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar produtos</h3></div>`;
        console.error(error);
    }
}

// =========================
// CARREGAR MARCAS
// =========================
async
