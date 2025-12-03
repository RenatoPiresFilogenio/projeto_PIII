// Variável global para guardar todos os produtos e permitir filtro local
let todosOsProdutos = [];

document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const idDoKit = urlParams.get('id');

    const form = document.getElementById('form-editar-kit');
    const btnExcluir = document.getElementById('btn-excluir');
    const btnFechar = document.getElementById('btn-fechar'); // Adicionado
    const btnAddProduto = document.getElementById('btn-add-produto');
    const listaUL = document.getElementById('lista_produto');
    
    if (!idDoKit) {
        exibirNotificacao("ID do kit não encontrado.", 'error');
        return;
    }
    
    checarNotificacoesUrl(idDoKit);

    // 1. CARREGA SELECTS PRIMEIRO (Com ?all=true para pegar tudo)
    await carregarSelectsIniciais(); 

    // 2. BUSCA O KIT
    try {
        const res = await fetch(`../../../../backend/Admin/Kits/ListarKitPorID.php?id=${idDoKit}`);
        const data = await res.json();
        
        if (data.status !== 'success') throw new Error(data.message);
        
        const kit = data.kit;

        // Preenche inputs
        document.getElementById('kit_id').value = kit.id_kit;
        document.getElementById('descricao_kit').value = kit.descricao;
        
        // Define Fornecedor
        const selectFornecedor = document.getElementById('fornecedor_kit_id');
        if (kit.produtos && kit.produtos.length > 0) {
            selectFornecedor.value = kit.produtos[0].fk_fornecedor_id; 
        }

        // Preenche lista visual
        listaUL.innerHTML = '';
        if (kit.produtos) {
            kit.produtos.forEach(p => {
                adicionarProdutoNaLista(p.fk_produto_id, p.quantidade, p.valor_unitario);
            });
        }

        // Renderiza Preview (CORREÇÃO DO ERRO AQUI)
        let nomeForn = 'Selecione';
        if (selectFornecedor.selectedIndex !== -1) {
            nomeForn = selectFornecedor.options[selectFornecedor.selectedIndex].text;
        }
        
        KitView(kit, nomeForn);
        
        document.getElementById('titulo_kit').innerHTML = `<i class="fas fa-edit"></i> Editar Kit: ${kit.descricao}`;

    } catch (e) {
        console.error("Erro ao carregar kit:", e);
        exibirNotificacao(e.message, 'error');
    }

    // --- EVENTOS ---

    btnAddProduto.addEventListener('click', () => {
        const selectProduto = document.getElementById('produtos_list_kit_id');
        const produtoId = selectProduto.value;
        if (produtoId) {
            const prod = todosOsProdutos.find(p => p.id_produto == produtoId);
            const preco = prod ? prod.valor_unitario : 0;
            
            adicionarProdutoNaLista(produtoId, 1, preco); 
            selectProduto.selectedIndex = 0; 
            
            atualizarCardEmTempoReal(); 
        } else {
            alert("Selecione um produto.");
        }
    });

    listaUL.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remover')) {
            e.target.closest('li.list_produto_item').remove();
            atualizarCardEmTempoReal();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (listaUL.children.length === 0) {
             exibirNotificacao("O kit deve conter pelo menos um produto.", 'error');
             return;
        }

        const formData = new FormData(form);
        
        try {
            const response = await fetch(form.action, { method: 'POST', body: formData });
            const data = await response.json();

            if (response.ok && data.success) {
                exibirNotificacao(data.message, 'success');
            } else {
                throw new Error(data.message || 'Erro ao salvar.');
            }
        } catch (error) {
            exibirNotificacao(error.message, 'error');
        }
    });

    btnExcluir.addEventListener('click', async () => {
        if (!confirm(`Excluir este kit?`)) return;
        const id = document.getElementById('kit_id').value;
        try {
            const response = await fetch(`../../../../backend/Admin/Kits/EditarKit.php?action=delete&id=${id}`, { method: 'GET' });
            const data = await response.json();
            if (data.success) {
                window.location.href = `../../Admin/cadastro_fornecedores/cadastroFornecedores.html?status=deleted_ok&tab=kits`;
            } else {
                exibirNotificacao(data.message, 'error');
            }
        } catch (error) {
            exibirNotificacao("Erro de rede.", 'error');
        }
    });

    // Botão Voltar
    if(btnFechar){
        btnFechar.addEventListener('click', () => {
            window.location.href = '../../Admin/cadastro_fornecedores/cadastroFornecedores.html?tab=kits';
        });
    }
    
    // Listeners de Atualização em Tempo Real
    document.getElementById('descricao_kit').addEventListener('input', atualizarCardEmTempoReal);
    document.getElementById('fornecedor_kit_id').addEventListener('change', atualizarCardEmTempoReal);
});

// --- FUNÇÕES AUXILIARES ---

async function carregarSelectsIniciais() {
    const selectFornecedor = document.getElementById('fornecedor_kit_id');
    const selectProduto = document.getElementById('produtos_list_kit_id');
    
    try {
        // 1. Fornecedores (Traz tudo)
        const resForn = await fetch("../../../../backend/Admin/Fornecedor/ListarFornecedor.php?all=true");
        const dataForn = await resForn.json();
        const forns = dataForn.fornecedores || [];
        
        selectFornecedor.innerHTML = '<option value="">Selecione um Fornecedor</option>';
        if(forns.length > 0){
            selectFornecedor.innerHTML += forns.map(f => `<option value="${f.id_fornecedor}">${f.nome}</option>`).join('');
        }

        // 2. Produtos (Traz tudo e guarda na memória)
        const resProd = await fetch("../../../../backend/Admin/CadastrarProduto/ListarProduto.php?all=true");
        const dataProd = await resProd.json();
        
        if (dataProd.status === 'success') {
            todosOsProdutos = dataProd.produtos || [];
            // Renderiza inicialmente com "todos"
            renderizarOpcoesProdutos('all');
        }
    } catch (e) {
        console.error(e);
        exibirNotificacao("Erro ao carregar selects.", 'error');
    }
}

// Filtro Chamado pelo HTML
window.filtrarSelectProdutos = function(tipo) {
    renderizarOpcoesProdutos(tipo);
}

function renderizarOpcoesProdutos(filtro) {
    const select = document.getElementById('produtos_list_kit_id');
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    
    const filtrados = todosOsProdutos.filter(p => {
        if (filtro === 'all') return true;
        return p.tipo_produto == filtro; 
    });

    select.innerHTML += filtrados.map(p => {
        const tipoIcon = p.tipo_produto == '1' ? '☀️' : '⚡';
        return `<option value="${p.id_produto}">${tipoIcon} ${p.nome} (${p.modelo})</option>`;
    }).join('');
}

function adicionarProdutoNaLista(produtoId, quantidade = 1, valor = 0.00) {
    const listaUL = document.getElementById('lista_produto');
    
    // Procura no array global
    const produto = todosOsProdutos.find(p => p.id_produto == produtoId);
    
    // Fallback
    const nomeExibicao = produto ? `${produto.nome} (${produto.modelo})` : `Produto #${produtoId}`;
    
    if (listaUL.querySelector(`input[name="produto_ids[]"][value="${produtoId}"]`)) return; 
    
    // Formatação inicial (se vier número, vira string BR. Se vier string, mantém)
    let valorFormatado = valor;
    if (typeof valor === 'number') {
        valorFormatado = formatarValorBR(valor);
    }

    const li = document.createElement('li');
    li.className = 'list_produto_item';
    
    // --- MUDANÇA AQUI: O input de valor agora é livre ---
    li.innerHTML = `
        <span><strong>${nomeExibicao}</strong></span>
        <div class="controles-produto"> 
            <input type="hidden" name="produto_ids[]" value="${produtoId}">
            
            <div style="display:flex; flex-direction:column;">
                <label style="font-size:0.7rem;">Qtd</label>
                <input type="number" class="input-mini" name="quantidades[]" value="${quantidade}" min="1" onchange="atualizarCardEmTempoReal()">
            </div>
            
            <div style="display:flex; flex-direction:column;">
                <label style="font-size:0.7rem;">Valor Unit. (R$)</label>
                <input type="text" class="input-mini" name="valores_unitarios[]" value="${valorFormatado}" placeholder="0,00" style="width: 100px;">
            </div>
            
            <button type="button" class="btn-remover" style="border:none; background:none; color:red; cursor:pointer; margin-top:10px;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    listaUL.appendChild(li);
}

function atualizarCardEmTempoReal() {
    const descEl = document.getElementById('descricao_kit');
    const fornEl = document.getElementById('fornecedor_kit_id');

    const kitMock = {
        descricao: descEl ? descEl.value : 'Kit',
        data_cadastro: new Date().toISOString()
    };
    
    // Verificação SEGURA do select
    let nomeForn = '-';
    if (fornEl && fornEl.selectedIndex !== -1) {
        nomeForn = fornEl.options[fornEl.selectedIndex].text;
    }
    
    KitView(kitMock, nomeForn);
}

function KitView(kit, fornecedorNome) {
    const container = document.getElementById('kit_view');
    if(!container) return; 

    const listaUL = document.getElementById('lista_produto');
    let itensHtml = '';
    
    if (listaUL && listaUL.children.length > 0) {
        const lis = listaUL.querySelectorAll('li');
        lis.forEach(li => {
            const nomeSpan = li.querySelector('span strong');
            const nome = nomeSpan ? nomeSpan.textContent : 'Item';
            const qtdInput = li.querySelector('input[name="quantidades[]"]');
            const qtd = qtdInput ? qtdInput.value : 1;
            itensHtml += `<li><span>${nome}</span> <strong>x${qtd}</strong></li>`;
        });
    } else {
        itensHtml = '<li style="color:#aaa;">Sem produtos</li>';
    }

    const htmlCard = `
        <div class="card-kit">
            <div class="card-icon-top" style="font-size: 2.5rem; color: #d69e2e;">
                <i class="fas fa-box-open"></i>
            </div>
            <h3 class="card-kit-titulo">${kit.descricao || 'Nome do Kit'}</h3>
            <div class="card-kit-specs">
                <div class="spec-box">
                    <span class="spec-label">Fornecedor</span>
                    <span class="spec-value" style="font-size:0.9rem;">${fornecedorNome}</span>
                </div>
            </div>
            <div class="card-kit-itens">
                <h4>Itens:</h4>
                <ul>${itensHtml}</ul>
            </div>
        </div>
    `;
    container.innerHTML = htmlCard;
}

// Helpers
function formatarData(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '-'; }
function formatarValorBR(v) { return parseFloat(v).toLocaleString('pt-BR',{minimumFractionDigits:2}); }
function checarNotificacoesUrl() {} 
function exibirNotificacao(msg, tipo) {
    const area = document.getElementById('notification-area');
    if(!area) return;
    const div = document.createElement('div');
    div.className = `notification ${tipo} show`;
    div.innerText = msg;
    area.appendChild(div);
    setTimeout(()=>div.remove(), 4000);
}