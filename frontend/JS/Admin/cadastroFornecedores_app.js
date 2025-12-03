// =========================
// VARIÁVEIS GLOBAIS DE PAGINAÇÃO
// =========================
let paginaAtualMarcas = 1;
let paginaAtualProdutos = 1;
let paginaAtualFornecedores = 1;
let paginaAtualKits = 1;

console.log("Sistema de Ativos Iniciado. Páginas:", { paginaAtualMarcas, paginaAtualProdutos, paginaAtualFornecedores, paginaAtualKits });

// =========================
// FUNÇÃO MESTRE DE PAGINAÇÃO
// =========================
window.mudarPagina = function (tipo, novaPagina) {
    console.log(`[CLICK] Mudando ${tipo} para página ${novaPagina}`);

    if (novaPagina < 1) return;

    if (tipo === 'marcas') {
        paginaAtualMarcas = novaPagina;
        carregarMarcasEPreencherSelect();
    }
    else if (tipo === 'produtos') {
        paginaAtualProdutos = novaPagina;
        carregarProdutos();
    }
    else if (tipo === 'fornecedores') {
        paginaAtualFornecedores = novaPagina;
        carregarFornecedores();
    }
    else if (tipo === 'kits') {
        paginaAtualKits = novaPagina;
        carregarKitsCadastrados();
    }
}

function renderizarPaginacaoGenerica(info, container, tipo) {
    // Limpa se não houver dados
    if (!info || parseInt(info.total_paginas) <= 1) {
        container.innerHTML = '';
        return;
    }

    const totalPaginas = parseInt(info.total_paginas);
    const pgAtual = parseInt(info.pagina_atual);

    let html = '';

    // Botão Anterior
    html += `<button class="pagination-btn" onclick="mudarPagina('${tipo}', ${pgAtual - 1})" ${pgAtual === 1 ? 'disabled' : ''}>&laquo;</button>`;

    // Lógica para não mostrar muitos botões se tiver muitas páginas
    let startPage = Math.max(1, pgAtual - 2);
    let endPage = Math.min(totalPaginas, pgAtual + 2);

    if (endPage - startPage < 4) {
        if (startPage === 1) endPage = Math.min(totalPaginas, startPage + 4);
        else if (endPage === totalPaginas) startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === pgAtual ? 'active' : '';
        // NOTA: As aspas simples em '${tipo}' são essenciais!
        html += `<button class="pagination-btn ${activeClass}" onclick="mudarPagina('${tipo}', ${i})">${i}</button>`;
    }

    // Botão Próximo
    html += `<button class="pagination-btn" onclick="mudarPagina('${tipo}', ${pgAtual + 1})" ${pgAtual >= totalPaginas ? 'disabled' : ''}>&raquo;</button>`;

    container.innerHTML = html;
}

// =========================
// FUNÇÃO HELPER
// =========================
function formatarData(dataString) {
    if (!dataString) return 'N/D';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

// =========================
// MODAIS
// =========================
const modalFornecedor = document.getElementById("modalFornecedor");
const modalProduto = document.getElementById("modalProduto");
const modalMarca = document.getElementById("modalMarca");
const modalKit = document.getElementById('modalKit');

function abrirModal(modalElement) { if (modalElement) modalElement.classList.add("active"); }
function fecharModal(modalElement) { if (modalElement) modalElement.classList.remove("active"); }

function abrirModalFornecedor() { abrirModal(modalFornecedor); }
function abrirModalProduto() { abrirModal(modalProduto); }
function abrirModalMarca() { abrirModal(modalMarca); }
function abrirModalKit() {
    carregarListKits(); // Recarrega os selects ao abrir
    abrirModal(modalKit);
}

function fecharModalFornecedor() { fecharModal(modalFornecedor); }
function fecharModalProduto() { fecharModal(modalProduto); }
function fecharModalMarca() { fecharModal(modalMarca); }
function fecharModalKit() { fecharModal(modalKit); }

window.addEventListener("click", (event) => {
    if (event.target.classList.contains('modal')) {
        fecharModal(event.target);
    }
});

// =========================
// TROCAR DE ABA
// =========================
function mostrarTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    const tabButton = document.querySelector(`[onclick="mostrarTab('${tab}')"]`);
    const tabContent = document.getElementById(`tab-${tab}`);

    if (tabButton) tabButton.classList.add("active");
    if (tabContent) tabContent.classList.add("active");
}

// =========================
// CARREGAR DADOS (COM PAGINAÇÃO)
// =========================

// --- KITS ---
async function carregarKitsCadastrados() {
    const container = document.getElementById("kitList");
    const paginacaoContainer = document.getElementById("paginacaoKits");

    // Pega os valores
    const termoBusca = document.getElementById('buscaKit') ? document.getElementById('buscaKit').value : '';
    const filtroConsumo = document.getElementById('filtroConsumoKit') ? document.getElementById('filtroConsumoKit').value : '';

    container.innerHTML = "<p>Carregando kits...</p>";

    try {
        // Envia o search e o consumo na URL
        const url = `../../../../backend/Admin/Kits/ListarKits.php?page=${paginaAtualKits}&search=${encodeURIComponent(termoBusca)}&consumo=${filtroConsumo}&_cache=${new Date().getTime()}`;

        const response = await fetch(url);
        const data = await response.json();
        const kits = data.produtos || [];

        if (kits.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum kit encontrado para esse perfil</h3></div>`;
            if (paginacaoContainer) paginacaoContainer.innerHTML = '';
            return;
        }

        container.innerHTML = kits.map(kit => {
            // Cálculo visual para ajudar o usuário a entender
            const consumoEstimado = Math.round(kit.potencia_ideal * 120); // Estimativa de geração

            return `
            <div class="card" id="kit-${kit.id_kit}">
                <div class="card-header">
                    <h3 class="card-title">Kit: <strong>${kit.descricao}</strong></h3>
                    <div class="card-actions">
                        <a href="../../../../frontend/dashboards/Admin/editar_kit/editar_kit.html?id=${kit.id_kit}" class="btn-icon btn-edit"><i class="fas fa-pencil-alt"></i></a>
                        <button class="btn-icon btn-delete" onclick="excluirKit(${kit.id_kit})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="info-grid">
                        <div class="info-item">
                            <dt class="info-label">Potência Ideal</dt>
                            <dd class="info-value" style="color: #2b6cb0; font-weight:bold;">${kit.potencia_ideal || 0} kWp</dd>
                        </div>
                        <div class="info-item">
                            <dt class="info-label">Geração Estimada</dt>
                            <dd class="info-value">~${consumoEstimado} kWh/mês</dd>
                        </div>
                    </dl>
                </div>
            </div>`;
        }).join("");

        if (data.paginacao && paginacaoContainer) {
            renderizarPaginacaoGenerica(data.paginacao, paginacaoContainer, 'kits');
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar kits.</h3></div>`;
    }
}

// Listener para Busca de Kits

const selectConsumoKit = document.getElementById('filtroConsumoKit');
if (selectConsumoKit) {
    selectConsumoKit.addEventListener('change', function () {
        paginaAtualKits = 1; // Reseta página
        carregarKitsCadastrados();
    });
}

const inputBuscaKit = document.getElementById('buscaKit');
if (inputBuscaKit) {
    inputBuscaKit.addEventListener('input', function () {
        paginaAtualKits = 1; // Reseta página
        carregarKitsCadastrados();
    });
}
// --- FORNECEDORES ---
async function carregarFornecedores() {
    const container = document.getElementById("fornecedoresList");
    const paginacaoContainer = document.getElementById("paginacaoFornecedores");

    // Pega o valor da busca
    const termoBusca = document.getElementById('buscaFornecedor') ? document.getElementById('buscaFornecedor').value : '';

    container.innerHTML = "<p>Carregando fornecedores...</p>";

    try {
        // Envia o search na URL
        const url = `../../../../backend/Admin/Fornecedor/ListarFornecedor.php?page=${paginaAtualFornecedores}&search=${encodeURIComponent(termoBusca)}&_cache=${new Date().getTime()}`;

        const response = await fetch(url);
        const data = await response.json();
        const fornecedores = data.fornecedores || [];

        if (fornecedores.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum fornecedor encontrado</h3></div>`;
            if (paginacaoContainer) paginacaoContainer.innerHTML = '';
            return;
        }

        container.innerHTML = fornecedores.map(f => `
            <div class="card" id="fornecedor-${f.id_fornecedor}">
                <div class="card-header">
                    <h3 class="card-title">Fornecedor: <strong>${f.nome}</strong></h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="abrirModalFornecedorEditar(${f.id_fornecedor})"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon btn-delete" onclick="excluirFornecedor(${f.id_fornecedor})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="info-grid">
                        <div class="info-item"><dt class="info-label">Email</dt><dd class="info-value">${f.email}</dd></div>
                        <div class="info-item"><dt class="info-label">Telefone</dt><dd class="info-value">${f.telefone}</dd></div>
                        <div class="info-item"><dt class="info-label">Vendas</dt><dd class="info-value">${f.total_vendas || 0}</dd></div>
                    </dl>
                </div>
            </div>
        `).join("");

        if (data.paginacao && paginacaoContainer) {
            renderizarPaginacaoGenerica(data.paginacao, paginacaoContainer, 'fornecedores');
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar</h3></div>`;
    }
}


// Listener para Busca de Fornecedores
const inputBuscaForn = document.getElementById('buscaFornecedor');
if (inputBuscaForn) {
    inputBuscaForn.addEventListener('input', function () {
        paginaAtualFornecedores = 1; // Reseta página
        carregarFornecedores();
    });
}

// --- PRODUTOS ---
async function carregarProdutos() {
    const container = document.getElementById("produtosList");
    const paginacaoContainer = document.getElementById("paginacaoProdutos");

    // Pega os valores dos filtros
    const termoBusca = document.getElementById('buscaProduto').value;
    const tipoProduto = document.getElementById('filtroTipoProduto').value;

    container.innerHTML = "<p>Carregando produtos...</p>";

    try {
        // Monta a URL com os filtros
        const url = `../../../../backend/Admin/CadastrarProduto/ListarProduto.php?page=${paginaAtualProdutos}&search=${encodeURIComponent(termoBusca)}&tipo=${tipoProduto}&_cache=${new Date().getTime()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro de servidor: ${response.status}`);

        const responseData = await response.json();
        const produtos = responseData.produtos || [];
        const infoPaginacao = responseData.paginacao;

        if (produtos.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum produto encontrado</h3></div>`;
            if (paginacaoContainer) paginacaoContainer.innerHTML = '';
            return;
        }

        container.innerHTML = produtos.map(p => {
            const valor = parseFloat(p.valor_unitario) || 0;
            const potencia = p.potencia_kwh || 'N/D';
            // Lógica visual para o tipo
            const tipoLabel = p.tipo_produto == '1' ? '<i class="fas fa-solar-panel"></i> Placa Solar' : '<i class="fas fa-bolt"></i> Inversor';

            return `
            <div class="card" id="produto-${p.id_produto}">
                <div class="card-header">
                    <h3 class="card-title"><strong>${p.nome}</strong></h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="abrirModalProdutoEditar(${p.id_produto})"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon btn-delete" onclick="excluirProduto(${p.id_produto})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="info-grid">
                        <div class="info-item"><dt class="info-label">Modelo</dt><dd class="info-value">${p.modelo || 'N/D'}</dd></div>
                        <div class="info-item"><dt class="info-label">Tipo</dt><dd class="info-value">${tipoLabel}</dd></div>
                    </dl>
                    <div class="placa-specs">
                        <div class="spec-item"><div class="spec-value">${potencia} kW</div><div class="spec-label">Potência</div></div>
                        <div class="spec-item"><div class="spec-value">${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div><div class="spec-label">Valor Unitário</div></div>
                    </div>
                </div>
            </div>`;
        }).join("");

        if (infoPaginacao && paginacaoContainer) {
            renderizarPaginacaoGenerica(infoPaginacao, paginacaoContainer, 'produtos');
        }

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar produtos.</h3></div>`;
    }
}

const inputBuscaProd = document.getElementById('buscaProduto');
if (inputBuscaProd) {
    inputBuscaProd.addEventListener('input', function () {
        paginaAtualProdutos = 1; // Reseta para pág 1 ao buscar
        carregarProdutos();
    });
}

// Listener para Filtro de Tipo (Select)
const selectTipoProd = document.getElementById('filtroTipoProduto');
if (selectTipoProd) {
    selectTipoProd.addEventListener('change', function () {
        paginaAtualProdutos = 1; // Reseta para pág 1 ao filtrar
        carregarProdutos();
    });
}

// --- MARCAS ---
async function carregarMarcasEPreencherSelect() {
    const listContainer = document.getElementById('marcasList');
    const selectContainer = document.getElementById('id_marca');
    const paginacaoContainer = document.getElementById('paginacaoMarcas');

    // Pega o valor da busca
    const termoBusca = document.getElementById('buscaMarca') ? document.getElementById('buscaMarca').value : '';

    listContainer.innerHTML = "<p>Carregando marcas...</p>";

    try {
        // Envia o search na URL
        const url = `../../../../backend/Admin/Marcas/ListarMarcas.php?page=${paginaAtualMarcas}&search=${encodeURIComponent(termoBusca)}&_cache=${new Date().getTime()}`;

        const response = await fetch(url);
        const responseData = await response.json();

        const marcas = responseData.marcas || [];
        const infoPaginacao = responseData.paginacao;

        // 1. Renderiza a Lista (Cards)
        if (marcas.length === 0) {
            listContainer.innerHTML = `<div class="empty-state"><h3>Nenhuma marca encontrada</h3></div>`;
            if (paginacaoContainer) paginacaoContainer.innerHTML = '';
        } else {
            listContainer.innerHTML = marcas.map(m => {
                const pais = m.pais_origem || 'N/D';
                const data = formatarData(m.data_cadastro);
                const site = m.site_oficial || '#';
                const siteTexto = m.site_oficial ? 'Link' : 'N/D'; // Ajustei para ficar mais clean

                return `
                <div class="card" id="marca-${m.id_marca}">
                    <div class="card-header">
                        <h3 class="card-title">Marca: <strong>${m.nome}</strong></h3>
                        <div class="card-actions">
                            <button class="btn-icon btn-edit" title="Editar" onclick="AbrirEditorMarca(${m.id_marca})"><i class="fas fa-pencil-alt"></i></button>
                            <button class="btn-icon btn-delete" title="Excluir" onclick="excluirMarca(${m.id_marca})"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                    <div class="card-body">
                        <dl class="info-grid">
                            <div class="info-item"><dt class="info-label">País</dt><dd class="info-value">${pais}</dd></div>
                            <div class="info-item"><dt class="info-label">Site</dt><dd class="info-value"><a href="https://${site.replace(/^https?:\/\//, '')}" target="_blank">${siteTexto}</a></dd></div>
                            <div class="info-item"><dt class="info-label">Cadastro</dt><dd class="info-value">${data}</dd></div>
                        </dl>
                    </div>
                </div>`;
            }).join("");

            if (infoPaginacao && paginacaoContainer) {
                renderizarPaginacaoGenerica(infoPaginacao, paginacaoContainer, 'marcas');
            }
        }

        // 2. Preenche o Select (Atenção: O select também será filtrado pela busca)
        if (selectContainer) {
            if (marcas.length === 0) {
                // Mantém a opção padrão se a busca não retornar nada
                selectContainer.innerHTML = `<option value="" disabled>Nenhuma marca encontrada</option>`;
            } else {
                const optionsHtml = ['<option value="" disabled selected>Selecione uma marca</option>'];
                marcas.forEach(m => optionsHtml.push(`<option value="${m.id_marca}" required>${m.nome}</option>`));
                selectContainer.innerHTML = optionsHtml.join("");
            }
        }

    } catch (error) {
        listContainer.innerHTML = `<div class="empty-state"><h3>Erro ao carregar marcas</h3></div>`;
        if (selectContainer) selectContainer.innerHTML = `<option value="" disabled>Erro</option>`;
        console.error("Erro ao carregar marcas:", error);
    }
}

const inputBuscaMarca = document.getElementById('buscaMarca');
if (inputBuscaMarca) {
    inputBuscaMarca.addEventListener('input', function () {
        paginaAtualMarcas = 1; // Reseta para a primeira página
        carregarMarcasEPreencherSelect();
    });
}

// =========================
// LÓGICA DO MODAL DE KITS (CORRIGIDA)
// =========================
async function carregarListKits() {
    const list_fornecedor = document.getElementById("fornecedor_list_kit_id");
    const list_product = document.getElementById("produtos_list_kit_id");
    if (!list_fornecedor || !list_product) return;

    list_fornecedor.innerHTML = "<option value=''>Carregando...</option>";
    list_fornecedor.disabled = true;
    list_product.innerHTML = "<option value=''>Aguardando...</option>";
    list_product.disabled = true;

    try {
        // CORREÇÃO AQUI: ListarFornecedor retorna objeto com chave 'fornecedores'
        let responseFornecedor = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php?_cache=" + new Date().getTime());
        const dataForn = await responseFornecedor.json();
        const fornecedores = dataForn.fornecedores || [];

        if (fornecedores.length === 0) {
            list_fornecedor.innerHTML = `<option value="">Nenhum fornecedor</option>`;
        } else {
            const optionsHTML = fornecedores.map(f => `<option value="${f.id_fornecedor}">${f.nome}</option>`);
            list_fornecedor.innerHTML = `<option value="" selected disabled>Selecione um fornecedor</option>${optionsHTML.join('')}`;
            list_fornecedor.disabled = false;
        }

        // CORREÇÃO AQUI: ListarProduto retorna objeto com chave 'produtos'
        let responseProdutos = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php?_cache=" + new Date().getTime());
        const dataProd = await responseProdutos.json();
        const produtos = dataProd.produtos || [];

        if (produtos.length > 0) {
            const optionsHTML_product = produtos.map(p => `<option value="${p.id_produto}">${p.nome}</option>`);
            list_product.innerHTML = `<option value="" selected disabled>Selecione um Produto</option>${optionsHTML_product.join('')}`;
            list_product.disabled = false;
        } else {
            list_product.innerHTML = `<option value="">Nenhum produto</option>`;
        }
    } catch (error) {
        console.error("Falha ao carregar listas do kit:", error);
        list_fornecedor.innerHTML = `<option value="">Erro</option>`;
        list_product.innerHTML = `<option value="">Erro</option>`;
    }
}

async function carregarListKitsFornecedor() {
    const list_kits = document.getElementById("kit_id");
    if (!list_kits) return;

    try {
        const responseKitsList = await fetch("../../../../backend/Admin/Kits/ListarKits.php?_cache=" + new Date().getTime());
        const data = await responseKitsList.json();
        const kits = data.produtos || []; // Usa a chave 'produtos' que o PHP retorna

        if (kits.length > 0) {
            list_kits.innerHTML = `
                <option value="">Selecione um kit</option>
                ${kits.map(kit => `<option value="${kit.id_kit}">Kit: ${kit.descricao}</option>`).join('')}
            `;
        } else {
            list_kits.innerHTML = '<option value="">Nenhum kit encontrado.</option>';
        }
    } catch (e) {
        console.error(e);
        list_kits.innerHTML = '<option value="">Erro</option>';
    }
}

// ... Resto das funções auxiliares (adicionarProdutoNaLista, exclusão, etc) ...
// MANTENHA AS FUNÇÕES DE EXCLUSÃO E ADICIONAR PRODUTO IGUAIS, ELAS ESTAVAM CERTAS.
// VOU REPETIR AQUI SÓ PARA GARANTIR QUE O ARQUIVO FIQUE COMPLETO

function adicionarProdutoNaLista() {
    const list_product_select = document.getElementById('produtos_list_kit_id');
    const lista_produto_ul = document.getElementById('lista_produto');
    const selectedOption = list_product_select.options[list_product_select.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
        alert("Selecione um produto.");
        return;
    }
    const produtoId = selectedOption.value;
    const produtoNome = selectedOption.text;

    const jaExiste = lista_produto_ul.querySelector(`input[name="produto_ids[]"][value="${produtoId}"]`);
    if (jaExiste) { alert("Produto já adicionado."); return; }

    const li = document.createElement('li');
    li.className = 'list_produto_item';
    li.innerHTML = `
        <span><strong>${produtoNome}</strong></span>
        <div class="controles-produto"> 
            <input type="hidden" name="produto_ids[]" value="${produtoId}">
            <div class="controle-item">
                <label>Qtd *</label>
                <input type="number" class="input_number" name="quantidades[]" value="1" min="1" required>
            </div>
            <div class="controle-item">
                <label>Valor *</label>
                <input type="text" class="input_valor" name="valores_unitarios[]" placeholder="0,00" required>
            </div>
        </div>`;
    lista_produto_ul.appendChild(li);
    list_product_select.selectedIndex = 0;
}

// Funções de Exclusão (Simplificadas para caber)
async function excluirGenerico(tipo, id) {
    if (!confirm("Tem certeza?")) return;
    let url = '';
    if (tipo === 'marca') url = `../../../../backend/Admin/Marcas/EditarMarca.php?action=delete&id=${id}`;
    if (tipo === 'produto') url = `../../../../backend/Admin/CadastrarProduto/EditarProduto.php?action=delete&id=${id}`;
    if (tipo === 'fornecedor') url = `../../../../backend/Admin/Fornecedor/EditarFornecedor.php?action=delete&id=${id}`;
    if (tipo === 'kit') url = `../../../../backend/Admin/Kits/EditarKit.php?action=delete&id=${id}`;

    try {
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        if (data.success) {
            alert("Excluído!");
            if (tipo === 'marca') { document.getElementById(`marca-${id}`)?.remove(); carregarMarcasEPreencherSelect(); }
            if (tipo === 'produto') { document.getElementById(`produto-${id}`)?.remove(); }
            if (tipo === 'fornecedor') { document.getElementById(`fornecedor-${id}`)?.remove(); }
            if (tipo === 'kit') { document.getElementById(`kit-${id}`)?.remove(); }
        } else { alert("Erro ao excluir"); }
    } catch (e) { alert("Erro de rede"); }
}

function excluirMarca(id) { excluirGenerico('marca', id); }
function excluirProduto(id) { excluirGenerico('produto', id); }
function excluirFornecedor(id) { excluirGenerico('fornecedor', id); }
function excluirKit(id) { excluirGenerico('kit', id); }

// Funções de Navegação
function abrirModalFornecedorEditar(id) { window.location.href = `../../../dashboards/Admin/editar_fornecedor/editar_fornecedor.html?id=${id}`; }
function AbrirEditorMarca(id) { window.location.href = `../../../dashboards/Admin/editar_marca/editar_marca.html?id=${id}`; }
function abrirModalProdutoEditar(id) { window.location.href = `../../../dashboards/Admin/editar_produto/editar_produto.html?id=${id}`; }

// =========================
// INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tab')) { mostrarTab(urlParams.get('tab')); }

    carregarFornecedores();
    carregarProdutos();
    carregarMarcasEPreencherSelect();
    carregarListKitsFornecedor();
    carregarKitsCadastrados();
    carregarListKits();

    const btn_conf = document.getElementById('conf_product_list');
    if (btn_conf) btn_conf.addEventListener('click', adicionarProdutoNaLista);
});