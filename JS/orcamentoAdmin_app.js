const orcamentosAprovados = [
            {
                id: 101,
                cliente: "João Silva",
                email: "joao@empresa.com",
                telefone: "(11) 99999-9999",
                fornecedor: "Tech Solutions",
                valor: 2500.00,
                dataAprovacao: "2024-09-16",
                dataVencimento: "2024-09-30",
                regiao: "sudeste",
                descricao: "Desenvolvimento de website corporativo com sistema de gestão de conteúdo, design responsivo e otimização para motores de busca.",
                itens: ["Design responsivo", "CMS personalizado", "SEO básico", "Treinamento"]
            },
            {
                id: 102,
                cliente: "Maria Santos",
                email: "maria@loja.com",
                telefone: "(47) 88888-8888",
                fornecedor: "Digital Works",
                valor: 1800.00,
                dataAprovacao: "2024-09-15",
                dataVencimento: "2024-09-25",
                regiao: "sul",
                descricao: "Sistema de vendas integrado com estoque, relatórios gerenciais e dashboard administrativo.",
                itens: ["Sistema de vendas", "Controle de estoque", "Relatórios", "Dashboard admin"]
            },
            {
                id: 103,
                cliente: "Carlos Mendes",
                email: "carlos@industria.com",
                telefone: "(11) 77777-7777",
                fornecedor: "Tech Solutions",
                valor: 4200.00,
                dataAprovacao: "2024-09-14",
                dataVencimento: "2024-10-15",
                regiao: "sudeste",
                descricao: "Sistema ERP completo para gestão empresarial incluindo financeiro, RH, vendas e produção.",
                itens: ["Módulo Financeiro", "Módulo RH", "Módulo Vendas", "Módulo Produção", "Relatórios avançados"]
            },
            {
                id: 104,
                cliente: "Ana Costa",
                email: "ana@startup.com",
                telefone: "(61) 66666-6666",
                fornecedor: "Code Masters",
                valor: 2800.00,
                dataAprovacao: "2024-09-13",
                dataVencimento: "2024-09-28",
                regiao: "centro-oeste",
                descricao: "Aplicativo mobile para iOS e Android com backend em nuvem e painel administrativo web.",
                itens: ["App iOS", "App Android", "Backend em nuvem", "Painel admin web"]
            }
        ];

        function formatarMoeda(valor) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor);
        }

        function formatarData(data) {
            return new Date(data).toLocaleDateString('pt-BR');
        }

        function calcularDiasRestantes(dataVencimento) {
            const hoje = new Date();
            const vencimento = new Date(dataVencimento);
            const diffTime = vencimento - hoje;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }

        function renderizarEstatisticas() {
            const total = orcamentosAprovados.length;
            const valorTotal = orcamentosAprovados.reduce((sum, orc) => sum + orc.valor, 0);
            const vencendoSoon = orcamentosAprovados.filter(orc => calcularDiasRestantes(orc.dataVencimento) <= 7).length;

            const container = document.getElementById('statsBar');
            container.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${total}</div>
                    <div class="stat-label">Aguardando Confirmação</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${formatarMoeda(valorTotal)}</div>
                    <div class="stat-label">Valor Total</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #e53e3e;">${vencendoSoon}</div>
                    <div class="stat-label">Vencendo em 7 dias</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${formatarMoeda(valorTotal / total)}</div>
                    <div class="stat-label">Valor Médio</div>
                </div>
            `;
        }

        function renderizarOrcamentos() {
            const filtroRegiao = document.getElementById('filtroRegiao').value;
            const filtroFornecedor = document.getElementById('filtroFornecedor').value;
            const buscaCliente = document.getElementById('buscaCliente').value.toLowerCase();

            let filtrados = orcamentosAprovados;

            if (filtroRegiao) {
                filtrados = filtrados.filter(orc => orc.regiao === filtroRegiao);
            }

            if (filtroFornecedor) {
                filtrados = filtrados.filter(orc => orc.fornecedor === filtroFornecedor);
            }

            if (buscaCliente) {
                filtrados = filtrados.filter(orc => orc.cliente.toLowerCase().includes(buscaCliente));
            }

            const container = document.getElementById('orcamentosAprovados');

            if (filtrados.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>Nenhum orçamento encontrado</h3>
                        <p>Tente ajustar os filtros ou aguarde novas aprovações dos clientes</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtrados.map(orcamento => {
                const diasRestantes = calcularDiasRestantes(orcamento.dataVencimento);
                const urgente = diasRestantes <= 7;

                return `
                    <div class="orcamento-card">
                        <div class="status-badge" style="background: ${urgente ? '#e53e3e' : '#38a169'};">
                            ${urgente ? '🚨 URGENTE' : '✅ APROVADO'}
                        </div>
                        
                        <div class="cliente-header">
                            <div class="cliente-nome">${orcamento.cliente}</div>
                            <div class="cliente-info">
                                📧 ${orcamento.email} | 📱 ${orcamento.telefone} | 📍 ${orcamento.regiao.toUpperCase()}
                            </div>
                        </div>

                        <div class="orcamento-details">
                            <div class="detail-item">
                                <div class="detail-label">Valor</div>
                                <div class="detail-value valor">${formatarMoeda(orcamento.valor)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Fornecedor</div>
                                <div class="detail-value">${orcamento.fornecedor}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Vence em</div>
                                <div class="detail-value" style="color: ${urgente ? '#e53e3e' : '#2d3748'};">
                                    ${diasRestantes} dias
                                </div>
                            </div>
                        </div>

                        <div class="orcamento-description">
                            <div class="description-title">Descrição do Projeto:</div>
                            <div class="description-text">${orcamento.descricao}</div>
                        </div>

                        <div class="actions">
                            <button class="btn btn-detalhes" onclick="verDetalhes(${orcamento.id})">
                                📋 Ver Detalhes
                            </button>
                            <button class="btn btn-rejeitar" onclick="rejeitarOrcamento(${orcamento.id})">
                                ❌ Rejeitar
                            </button>
                            <button class="btn btn-confirmar" onclick="confirmarOrcamento(${orcamento.id})">
                                ✅ Confirmar Execução
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function confirmarOrcamento(id) {
            const orcamento = orcamentosAprovados.find(orc => orc.id === id);
            document.getElementById('modalTitle').textContent = `Confirmar - ${orcamento.cliente}`;
            document.getElementById('modalObservacoes').style.display = 'block';
            
            document.getElementById('btnConfirmarModal').onclick = function() {
                const observacoes = document.getElementById('observacoes').value;
                
                // Simular confirmação
                alert(`✅ Orçamento de ${orcamento.cliente} confirmado com sucesso!\nValor: ${formatarMoeda(orcamento.valor)}\nObservações: ${observacoes || 'Nenhuma'}`);
                
                // Remover da lista
                const index = orcamentosAprovados.findIndex(orc => orc.id === id);
                orcamentosAprovados.splice(index, 1);
                
                fecharModal();
                renderizarEstatisticas();
                renderizarOrcamentos();
            };
        }

        function rejeitarOrcamento(id) {
            const orcamento = orcamentosAprovados.find(orc => orc.id === id);
            const motivo = prompt(`Motivo da rejeição do orçamento de ${orcamento.cliente}:`);
            
            if (motivo) {
                alert(`❌ Orçamento de ${orcamento.cliente} rejeitado.\nMotivo: ${motivo}`);
                
                // Remover da lista
                const index = orcamentosAprovados.findIndex(orc => orc.id === id);
                orcamentosAprovados.splice(index, 1);
                
                renderizarEstatisticas();
                renderizarOrcamentos();
            }
        }

        function verDetalhes(id) {
            const orcamento = orcamentosAprovados.find(orc => orc.id === id);
            const detalhes = `
DETALHES COMPLETOS DO ORÇAMENTO

Cliente: ${orcamento.cliente}
Email: ${orcamento.email}
Telefone: ${orcamento.telefone}
Região: ${orcamento.regiao.toUpperCase()}

Fornecedor: ${orcamento.fornecedor}
Valor: ${formatarMoeda(orcamento.valor)}
Data de Aprovação: ${formatarData(orcamento.dataAprovacao)}
Data de Vencimento: ${formatarData(orcamento.dataVencimento)}

Descrição:
${orcamento.descricao}

Itens Inclusos:
${orcamento.itens.map(item => `• ${item}`).join('\n')}
            `;
            
            alert(detalhes);
        }

        function fecharModal() {
            document.getElementById('modalObservacoes').style.display = 'none';
            document.getElementById('observacoes').value = '';
        }

        // Event listeners
        document.getElementById('filtroRegiao').addEventListener('change', renderizarOrcamentos);
        document.getElementById('filtroFornecedor').addEventListener('change', renderizarOrcamentos);
        document.getElementById('buscaCliente').addEventListener('input', renderizarOrcamentos);

        // Fechar modal ao clicar fora
        document.getElementById('modalObservacoes').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModal();
            }
        });

        // Inicializar página
        renderizarEstatisticas();
        renderizarOrcamentos();