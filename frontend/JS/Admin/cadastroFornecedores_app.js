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
document.addEventListener('DOMContentLoaded', async () => {
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
            </div>`).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar fornecedores</h3></div>`;
        console.log(error);
    }
})


// =========================
// CARREGAR PRODUTOS
// =========================

document.addEventListener('DOMContentLoaded', async () => {
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
    </div>`).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar produtos</h3></div>`;
        console.error(error);
    }
})

// =========================
// CARREGAR MARCAS
// =========================

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('marcasList');
    container.innerHTML = "<p>Carregando...</p>";

    try {

        const response = await fetch('../../../../backend/Admin/Marcas/ListarMarcas.php');
        const responseData = await response.json();

        const marcas = responseData.marcas;

        if (!marcas || marcas.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhuma marca cadastrada</h3></div>`;
            return;
        }

        container.innerHTML = marcas.map(m => `
            <div class="fornecedor-card">
                <h3>Informações da Marca</h3>
                <p><strong>Marca:</strong> ${m.nome}</p>
                <p><strong>Pais de origem:</strong> ${m.pais_origem}</p>
                <p><strong>Site oficial:</strong> ${m.site_oficial}</p>
                 <p><strong>Data de cadastro:</strong> ${m.data_cadastro}</p>
            </div>`
        ).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar marcas</h3></div>`;
        console.error(error);
    }
});

// ===========================
// CARREGAR MARCAS PARA CADASTRAR PRODUTO
// ===========================  

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('id_marca');

    try {

        const response = await fetch('../../../../backend/Admin/Marcas/ListarMarcas.php');
        const responseData = await response.json();

        const marca = responseData.marcas;
        console.log(marca)
        container.innerHTML = marca.map(m => `
             <option value="${m.id_marca}" required>${m.nome}</option>
             `)

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar marcas</h3></div>`;
        console.error(error);
    }

})
