// =========================
// FUNÇÃO HELPER
// =========================

/**
 * Formata uma string de data (YYYY-MM-DD) para DD/MM/YYYY.
 * @param {string} dataString - A string de data do banco.
 * @returns {string} - A data formatada ou 'N/D'.
 */
function formatarData(dataString) {
    if (!dataString) return 'N/D';
    try {
        // Adiciona T00:00:00 para evitar problemas de fuso horário
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        console.error("Erro ao formatar data:", dataString, e);
        return 'Data inválida';
    }
}

// =========================
// MODAIS (REFATORADO PARA CSS)
// =========================

// Obtém a referência para os elementos do modal uma única vez
const modalFornecedor = document.getElementById("modalFornecedor");
const modalProduto = document.getElementById("modalProduto");
const modalMarca = document.getElementById("modalMarca");
const modalKit = document.getElementById('modalKit');
// Adicionei isso para garantir que todos os modais sejam encontrados
const allModals = [modalFornecedor, modalProduto, modalMarca, modalKit];

/**
 * Função genérica para abrir um modal
 * @param {HTMLElement} modalElement - O elemento do modal a ser aberto
 */
function abrirModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add("active"); // Usa classe CSS para animação
    }
}

/**
 * Função genérica para fechar um modal
 * @param {HTMLElement} modalElement 
 */
function fecharModal(modalElement) {
    if (modalElement) {
        modalElement.classList.remove("active"); // Usa classe CSS para animação
    }
}

// ----- Funções Específicas-----
function abrirModalFornecedor() { abrirModal(modalFornecedor); }
function abrirModalProduto() { abrirModal(modalProduto); }
function abrirModalMarca() { abrirModal(modalMarca); }
function abrirModalKit() { abrirModal(modalKit); }

// --- fechar modal ---
// (Adicionei o 'modalElement' que faltava na sua definição original)
function fecharModalFornecedor() { fecharModal(modalFornecedor); }
function fecharModalProduto() { fecharModal(modalProduto); }
function fecharModalMarca() { fecharModal(modalMarca); }
function fecharModalKit() { fecharModal(modalKit); }

// ----- FECHAR MODAL AO CLICAR FORA -----
window.addEventListener("click", (event) => {
    // Verifica se o clique foi no fundo escuro do modal
    if (event.target.classList.contains('modal')) {
        fecharModal(event.target);
    }
});


// =========================
// TROCAR DE ABA
// =========================
function mostrarTab(tab) {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    const tabButton = document.querySelector(`[onclick="mostrarTab('${tab}')"]`);
    const tabContent = document.getElementById(`tab-${tab}`);

    if (tabButton) tabButton.classList.add("active");
    if (tabContent) tabContent.classList.add("active");
}

// =========================
// RENDERIZAÇÃO DOS CARDS (O "TCHAM")
// =========================

/**
 * Carrega e renderiza os KITS cadastrados
 */
async function carregarKitsCadastrados() {
    const container = document.getElementById("kitList");
    container.innerHTML = "<p>Carregando kits...</p>";

    try {
        const responseKits = await fetch("../../../../backend/Admin/Kits/ListarKits.php");
        const data = await responseKits.json();
        const kits = data.produtos; // 'produtos' parece ser o nome do array na sua API

        if (!kits || kits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum kit cadastrado</h3>
                    <p>Adicione kits clicando em "Novo kit".</p>
                </div>`;
            return;
        }

        container.innerHTML = kits.map(kit => `
            <div class="card" id="kit-${kit.id_kit}">
                <div class="card-header">
                    <h3 class="card-title">Kit: <strong>${kit.descricao}</strong></h3>
                    <div class="card-actions">
                        <a href="../../../../frontend/dashboards/Admin/editar_kit/editar_kit.html?id=${kit.id_kit}" class="btn-icon btn-edit" title="Editar">
                            <i class="fas fa-pencil-alt"></i>
                        </a>
                        <button class="btn-icon btn-delete" title="Excluir" onclick="ExcluirFornecedor(${kit.id_kit})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="info-grid">
                        <div class="info-item">
                            <dt class="info-label">Descrição</dt>
                            <dd class="info-value">${kit.descricao || 'Sem descrição'}</dd>
                        </div>
                        </dl>
                </div>
            </div>
        `).join("");

    } catch (e) {
        console.error("Erro ao carregar kits:", e);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar kits.</h3></div>`;
    }
}

/**
 * Carrega e renderiza os FORNECEDORES
 */
async function carregarFornecedores() {
    const container = document.getElementById("fornecedoresList");
    container.innerHTML = "<p>Carregando fornecedores...</p>";

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
            <div class="card" id="fornecedor-${f.id_fornecedor}">
                <div class="card-header">
                    <h3 class="card-title">Fornecedor: <strong>${f.nome}</strong></h3>
                    <div class="card-actions">
                        <a href="../../../../frontend/dashboards/Admin/editar_fornecedor/editar_fornecedor.html?id=${f.id_fornecedor}" class="btn-icon btn-edit" title="Editar">
                            <i class="fas fa-pencil-alt"></i>
                        </a>
                        <button class="btn-icon btn-delete" title="Excluir" onclick="ExcluirFornecedor(${f.id_fornecedor})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="info-grid">
                        <div class="info-item">
                            <dt class="info-label">Email</dt>
                            <dd class="info-value"><a href="mailto:${f.email}">${f.email}</a></dd>
                        </div>
                        <div class="info-item">
                            <dt class="info-label">Telefone</dt>
                            <dd class="info-value">${f.telefone}</dd>
                        </div>
                        <div class="info-item">
                            <dt class="info-label">Total de Vendas</dt>
                            <dd class="info-value">${f.total_vendas || 0}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        `).join("");

    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar fornecedores</h3></div>`;
        console.error("Erro ao carregar fornecedores:", error);
    }
}

/**
 * Carrega e renderiza os PRODUTOS
 */
async function carregarProdutos() {
    const container = document.getElementById("produtosList");
    container.innerHTML = "<p>Carregando produtos...</p>";

    try {
        const response = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");
        if (!response.ok) throw new Error(`Erro de servidor: ${response.status}`);
        
        const responseData = await response.json();
        if (responseData.status === 'error') throw new Error(`Erro na API: ${responseData.message}`);

        const produtos = responseData.produtos;

        if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>Nenhum produto cadastrado</h3></div>`;
            return;
        }

        container.innerHTML = produtos.map(p => {
            // Assumindo que a API retorna 'valor_unitario' e 'potencia_kwh'
            const valor = parseFloat(p.valor_unitario) || 0;
            const potencia = p.potencia_kwh || 'N/D';

            return `
            <div class="card" id="produto-${p.id_produto}">
                <div class="card-header">
                    <h3 class="card-title">Produto: <strong>${p.nome}</strong></h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" title="Editar" onclick="abrirModalProdutoEditar(${p.id_produto})">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn-icon btn-delete" title="Excluir" onclick="ExcluirFornecedor(${p.id_produto})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="info-grid">
                        <div class="info-item">
                            <dt class="info-label">Modelo</dt>
                            <dd class="info-value">${p.modelo || 'N/D'}</dd>
                        </div>
                        <div class="info-item">
                            <dt class="info-label">Tipo</dt>
                            <dd class="info-value">${p.tipo_produto === '1' ? 'Placa Solar' : 'Inversor'}</dd>
                        </div>
                    </dl>
                    
                    <div class="placa-specs">
                        <div class="spec-item">
                            <div class="spec-value">${potencia} kW</div>
                            <div class="spec-label">Potência</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                            <div class="spec-label">Valor Unitário</div>
                        </div>
                    </div>
                </div>
            </div>
            `
        }).join("");

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar produtos.</h3><p>Detalhes: ${error.message}</p></div>`;
    }
}

/**
 * Carrega MARCAS (para a lista E para o select de produtos)
 */
async function carregarMarcasEPreencherSelect() {
    const listContainer = document.getElementById('marcasList');
    const selectContainer = document.getElementById('id_marca');

    listContainer.innerHTML = "<p>Carregando marcas...</p>";

    try {
        const response = await fetch('../../../../backend/Admin/Marcas/ListarMarcas.php');
        const responseData = await response.json();
        const marcas = responseData.marcas;

        if (!marcas || marcas.length === 0) {
            listContainer.innerHTML = `<div class="empty-state"><h3>Nenhuma marca cadastrada</h3></div>`;
        } else {
            // Renderiza os CARDS de Marcas
            listContainer.innerHTML = marcas.map(m => {
                const pais = m.pais_origem || 'N/D';
                const data = formatarData(m.data_cadastro);
                const site = m.site_oficial || '#';
                const siteTexto = m.site_oficial || 'Nenhum';
                
                return `
                <div class="card" id="marca-${m.id_marca}">
                    <div class="card-header">
                        <h3 class="card-title">Marca: <strong>${m.nome}</strong></h3>
                        <div class="card-actions">
                            <button class="btn-icon btn-edit" title="Editar" onclick="AbrirEditorMarca(${m.id_marca})">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="btn-icon btn-delete" title="Excluir" onclick="ExcluirFornecedor(${m.id_marca})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <dl class="info-grid">
                            <div class="info-item">
                                <dt class="info-label">País de Origem</dt>
                                <dd class="info-value">${pais}</dd>
                            </div>
                            <div class="info-item">
                                <dt class="info-label">Site Oficial</dt>
                                <dd class="info-value">
                                    <a href="https://${site}" target="_blank">${siteTexto}</a>
                                </dd>
                            </div>
                            <div class="info-item">
                                <dt class="info-label">Data de Cadastro</dt>
                                <dd class="info-value">${data}</dd>
                            </div>
                        </dl>
                    </div>
                </div>`
            }).join("");
        }

        // Preenche o SELECT no modal de Produtos
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
        listContainer.innerHTML = `<div class="empty-state"><h3>Erro ao carregar marcas</h3></div>`;
        selectContainer.innerHTML = `<option value="" disabled>Erro ao carregar</option>`;
        console.error("Erro ao carregar marcas:", error);
    }
}


// =========================
// FUNÇÕES DE NAVEGAÇÃO
// =========================
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

// =========================
// LÓGICA DO MODAL DE KITS
// =========================

/**
 * Carrega os selects de Fornecedor e Produto dentro do modal de Kits.
 */
async function carregarListKits() {
    const list_fornecedor = document.getElementById("fornecedor_list_kit_id");
    const list_product = document.getElementById("produtos_list_kit_id");

    list_fornecedor.innerHTML = "<option value=''>Carregando fornecedores...</option>";
    list_fornecedor.disabled = true;
    list_product.innerHTML = "<option value=''>Aguardando...</option>";
    list_product.disabled = true;

    try {
        let responseFornecedor = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php");
        if (!responseFornecedor.ok) throw new Error(`Erro HTTP (Fornecedores): ${responseFornecedor.status}`);
        
        const fornecedores = await responseFornecedor.json();

        if (!fornecedores || fornecedores.length === 0) {
            list_fornecedor.innerHTML = `<option value="">Nenhum fornecedor</option>`;
            list_product.innerHTML = `<option value="">Nenhum fornecedor</option>`;
        } else {
            const optionsHTML = fornecedores.map(fornecedor =>
                `<option value="${fornecedor.id_fornecedor}">${fornecedor.nome}</option>`
            );
            list_fornecedor.innerHTML = `
                <option value="" selected disabled>Selecione um fornecedor</option>
                ${optionsHTML.join('')}
            `;
            list_fornecedor.disabled = false;
        }

        let responseProdutos = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php");
        if (!responseProdutos.ok) throw new Error(`Erro HTTP (Produtos): ${responseProdutos.status}`);
        
        const responseData = await responseProdutos.json();
        const produtos = responseData.produtos;

        if (produtos && produtos.length > 0) {
            const optionsHTML_product = produtos.map(produto =>
                `<option value="${produto.id_produto}">${produto.nome}</option>`
            );
            list_product.innerHTML = `
                <option value="" selected disabled>Selecione um Produto</option>
                ${optionsHTML_product.join('')}
            `;
            list_product.disabled = false;
        } else {
            list_product.innerHTML = `<option value="">Nenhum produto</option>`;
        }
    } catch (error) {
        console.error("Falha ao carregar listas do kit:", error);
        list_fornecedor.innerHTML = `<option value="">Falha ao carregar</option>`;
        list_product.innerHTML = `<option value="">Falha ao carregar</option>`;
    }
}

/**
 * Carrega a lista de kits no modal de Fornecedor.
 */
async function carregarListKitsFornecedor() {
    const list_kits = document.getElementById("kit_id");

    try {
        const responseKitsList = await fetch("../../../../backend/Admin/Kits/ListarKits.php");
        const data = await responseKitsList.json();

        if (data.status === "success" && Array.isArray(data.produtos)) {
            list_kits.innerHTML = `
                <option value="">Selecione um kit</option>
                ${data.produtos.map(kit => `
                <option value="${kit.id_kit}">
                    Kit: ${kit.descricao}
                </option>
                `).join('')}
            `;
        } else {
            list_kits.innerHTML = '<option value="">Nenhum kit encontrado.</option>';
        }
    } catch (e) {
        console.error("Erro ao carregar ou exibir kits:", e);
        list_kits.innerHTML = '<option value="">Erro ao carregar kits.</option>';
    }
}

/**
 * Adiciona o produto selecionado à lista <ul> no modal de Kit.
 */
function adicionarProdutoNaLista() {
    const list_product_select = document.getElementById('produtos_list_kit_id');
    const lista_produto_ul = document.getElementById('lista_produto');
    
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

    // Este HTML corresponde ao novo CSS que adicionei
    li.innerHTML = `
        <span>${produtoNome}</span>
        
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
            
            <button type="button" class="btn-remover" aria-label="Remover ${produtoNome}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;

    lista_produto_ul.appendChild(li);
    list_product_select.selectedIndex = 0;
}

/**
 * Observa cliques na lista de produtos do kit (para remoção).
 */
function gerenciarCliquesLista(event) {
    // Procura pelo botão de remover
    const removeButton = event.target.closest('.btn-remover');
    if (removeButton) {
        // Remove o <li> pai
        removeButton.closest('li.list_produto_item').remove();
    }
}


// =========================
// EVENT LISTENER PRINCIPAL (DOMContentLoaded)
// =========================

document.addEventListener('DOMContentLoaded', () => {
    // Funções de carregamento principais
    carregarFornecedores();
    carregarProdutos();
    carregarMarcasEPreencherSelect();
    carregarListKitsFornecedor(); // Preenche select no modal Fornecedor
    carregarKitsCadastrados(); // Renderiza cards de Kits
    
    // Carrega selects do modal de Kits
    carregarListKits(); 

    // --- Listeners do Modal de Kit ---
    const btn_conf_product = document.getElementById('conf_product_list');
    const lista_produto_ul = document.getElementById('lista_produto');
    const formKit = document.getElementById('formKit');

    if (btn_conf_product) {
        btn_conf_product.addEventListener('click', adicionarProdutoNaLista);
    }
    
    if (lista_produto_ul) {
        lista_produto_ul.addEventListener('click', gerenciarCliquesLista);
    }
    
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