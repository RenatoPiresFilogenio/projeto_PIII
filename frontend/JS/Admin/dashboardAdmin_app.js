const orcamentos = [
            {
                id: 1,
                cliente: "João Silva",
                fornecedor: "Tech Solutions",
                valor: 2500.00,
                data: "2024-09-15",
                status: "aprovado",
                regiao: "sudeste",
            },
            {
                id: 2,
                cliente: "Maria Santos",
                fornecedor: "Digital Works",
                valor: 1800.00,
                data: "2024-09-12",
                status: "aprovado",
                regiao: "sul",
            },
            {
                id: 3,
                cliente: "Pedro Costa",
                fornecedor: "Code Masters",
                valor: 3200.00,
                data: "2024-09-10",
                status: "nao-liberado",
                regiao: "centro-oeste",
            },
            {
                id: 4,
                cliente: "Ana Oliveira",
                fornecedor: "Web Pro",
                valor: 950.00,
                data: "2024-09-08",
                status: "recusado",
                regiao: "nordeste",
            },
            {
                id: 5,
                cliente: "Carlos Mendes",
                fornecedor: "Tech Solutions",
                valor: 4200.00,
                data: "2024-09-05",
                status: "aprovado",
                regiao: "sudeste",
            },
            {
                id: 6,
                cliente: "Lucia Ferreira",
                fornecedor: "Digital Works",
                valor: 1600.00,
                data: "2024-09-03",
                status: "aprovado",
                regiao: "sul",
            },
            {
                id: 7,
                cliente: "Roberto Lima",
                fornecedor: "Code Masters",
                valor: 2800.00,
                data: "2024-09-01",
                status: "aprovado",
                regiao: "centro-oeste",
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

        function renderizarOrcamentosEscolhidos() {
            const filtroStatus = document.getElementById('filtroStatus').value;
            const filtroRegiao = document.getElementById('filtroRegiao').value;
            
            let filtrados = orcamentos;
            
            if (filtroStatus) {
                filtrados = filtrados.filter(o => o.status === filtroStatus);
            }
            
            if (filtroRegiao) {
                filtrados = filtrados.filter(o => o.regiao === filtroRegiao);
            }

            const container = document.getElementById('orcamentosEscolhidos');
            
            if (filtrados.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>Nenhum orçamento encontrado</h3><p>Tente ajustar os filtros acima</p></div>';
                return;
            }

            container.innerHTML = filtrados.map(orcamento => `
                <div class="orcamento-item" onclick="verOrcamento(${orcamento.id})">
                    <div class="orcamento-header">
                        <div class="cliente-nome">${orcamento.cliente}</div>
                        <div class="orcamento-valor">${formatarMoeda(orcamento.valor)}</div>
                    </div>
                    <div class="orcamento-info">
                        <span>${orcamento.fornecedor} • ${orcamento.regiao.toUpperCase()}</span>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="status ${orcamento.status}">
                                ${orcamento.status === 'nao-liberado' ? 'Não Liberado' : 
                                  orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
                            </span>
                            <span>${formatarData(orcamento.data)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function renderizarEstatisticasGerais() {
            const stats = {
                total: orcamentos.length,
                aprovados: orcamentos.filter(o => o.status === 'aprovado').length,
                recusados: orcamentos.filter(o => o.status === 'recusado').length,
                naoLiberados: orcamentos.filter(o => o.status === 'nao-liberado').length,
                valorTotal: orcamentos.reduce((sum, o) => sum + o.valor, 0)
            };

            const container = document.getElementById('estatisticasGerais');
            container.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total de Orçamentos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #38a169;">${stats.aprovados}</div>
                    <div class="stat-label">Aprovados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #e53e3e;">${stats.recusados}</div>
                    <div class="stat-label">Recusados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #d69e2e;">${stats.naoLiberados}</div>
                    <div class="stat-label">Não Liberados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="font-size: 1.5rem;">${formatarMoeda(stats.valorTotal)}</div>
                    <div class="stat-label">Valor Total</div>
                </div>
            `;
        }

        function renderizarClientesPorRegiao() {
            const clientesPorRegiao = {};
            
            orcamentos.forEach(orc => {
                if (!clientesPorRegiao[orc.regiao]) {
                    clientesPorRegiao[orc.regiao] = {};
                }
                if (!clientesPorRegiao[orc.regiao][orc.cliente]) {
                    clientesPorRegiao[orc.regiao][orc.cliente] = {
                        aprovados: 0,
                        recusados: 0,
                        naoLiberados: 0
                    };
                }
                
                if (orc.status === 'aprovado') clientesPorRegiao[orc.regiao][orc.cliente].aprovados++;
                else if (orc.status === 'recusado') clientesPorRegiao[orc.regiao][orc.cliente].recusados++;
                else clientesPorRegiao[orc.regiao][orc.cliente].naoLiberados++;
            });

            const container = document.getElementById('clientesPorRegiao');
            
            container.innerHTML = Object.keys(clientesPorRegiao).map(regiao => `
                <div class="regiao-block">
                    <div class="regiao-title">${regiao}</div>
                    ${Object.keys(clientesPorRegiao[regiao]).map(cliente => {
                        const stats = clientesPorRegiao[regiao][cliente];
                        return `
                            <div class="cliente-item">
                                <div class="cliente-header">${cliente}</div>
                                <div class="cliente-stats">
                                    <span class="stat-badge aprovados">${stats.aprovados} Aprovados</span>
                                    <span class="stat-badge recusados">${stats.recusados} Recusados</span>
                                    <span class="stat-badge nao-liberados">${stats.naoLiberados} Pendentes</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('');
        }

        function calcularRegiaoMaiorAprovacao() {
            const regioes = {};
            
            orcamentos.forEach(orc => {
                if (!regioes[orc.regiao]) {
                    regioes[orc.regiao] = { total: 0, aprovados: 0 };
                }
                regioes[orc.regiao].total++;
                if (orc.status === 'aprovado') {
                    regioes[orc.regiao].aprovados++;
                }
            });

            const ranking = Object.keys(regioes).map(regiao => ({
                regiao,
                ...regioes[regiao],
                taxa: regioes[regiao].aprovados / regioes[regiao].total
            })).sort((a, b) => b.taxa - a.taxa);

            const container = document.getElementById('regiaoMaiorAprovacao');
            container.innerHTML = ranking.map((item, index) => `
                <div class="insight-item">
                    <div class="insight-title">#${index + 1} ${item.regiao.toUpperCase()}</div>
                    <div class="insight-value">${(item.taxa * 100).toFixed(1)}%</div>
                    <div class="insight-desc">${item.aprovados} aprovados de ${item.total} orçamentos</div>
                </div>
            `).join('');
        }

        function calcularFornecedoresTop() {
            const fornecedores = {};
            
            orcamentos.forEach(orc => {
                const key = `${orc.fornecedor}-${orc.regiao}`;
                if (!fornecedores[key]) {
                    fornecedores[key] = {
                        fornecedor: orc.fornecedor,
                        regiao: orc.regiao,
                        total: 0,
                        aprovados: 0
                    };
                }
                fornecedores[key].total++;
                if (orc.status === 'aprovado') {
                    fornecedores[key].aprovados++;
                }
            });

            const ranking = Object.values(fornecedores)
                .map(f => ({
                    ...f,
                    taxa: f.aprovados / f.total
                }))
                .sort((a, b) => b.taxa - a.taxa)
                .slice(0, 5);

            const container = document.getElementById('fornecedoresTop');
            container.innerHTML = ranking.map((fornecedor, index) => `
                <div class="insight-item">
                    <div class="insight-title">#${index + 1} - ${fornecedor.regiao.toUpperCase()}</div>
                    <div class="insight-value">${fornecedor.fornecedor}</div>
                    <div class="insight-desc">${(fornecedor.taxa * 100).toFixed(1)}% aprovação (${fornecedor.aprovados}/${fornecedor.total})</div>
                </div>
            `).join('');
        }

        function verOrcamento(id) {
            window.location.href = `ver-orcamento.html?id=${id}`;
        }

        // Event listeners
        document.getElementById('filtroStatus').addEventListener('change', renderizarOrcamentosEscolhidos);
        document.getElementById('filtroRegiao').addEventListener('change', renderizarOrcamentosEscolhidos);

        // Inicializar dashboard
        renderizarOrcamentosEscolhidos();
        renderizarEstatisticasGerais();
        renderizarClientesPorRegiao();
        calcularRegiaoMaiorAprovacao();
        calcularFornecedoresTop();