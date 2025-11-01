 let fornecedores = [
            {
                id: 1,
                nome: "SolarTech Solutions",
                cnpj: "12.345.678/0001-90",
                email: "contato@solartech.com",
                telefone: "(11) 99999-9999",
                regiao: "sudeste",
                cidade: "São Paulo",
                endereco: "Rua das Indústrias, 1234",
                observacoes: "Fornecedor premium com excelente qualidade",
                orcamentos: 15,
                aprovacao: 85
            },
            {
                id: 2,
                nome: "EcoEnergy Brasil",
                cnpj: "98.765.432/0001-10",
                email: "vendas@ecoenergy.com.br",
                telefone: "(47) 88888-8888",
                regiao: "sul",
                cidade: "Florianópolis",
                endereco: "Av. Sustentável, 567",
                observacoes: "Especialista em placas de alta eficiência",
                orcamentos: 22,
                aprovacao: 92
            },
            {
                id: 3,
                nome: "Nordeste Solar",
                cnpj: "11.222.333/0001-44",
                email: "info@nordestesolar.com",
                telefone: "(85) 77777-7777",
                regiao: "nordeste",
                cidade: "Fortaleza",
                endereco: "Rua do Sol, 890",
                observacoes: "Atende todo o nordeste com preços competitivos",
                orcamentos: 8,
                aprovacao: 78
            }
        ];

        let placasSolares = [
            {
                id: 1,
                modelo: "ST-400W Monocristalina",
                fornecedorId: 1,
                fornecedorNome: "SolarTech Solutions",
                potencia: 400,
                eficiencia: 20.5,
                preco: 850.00,
                garantia: 25,
                dimensoes: "200 x 100 x 4",
                peso: 22.5,
                especificacoes: "Células monocristalinas PERC, resistente a granizo até 25mm"
            },
            {
                id: 2,
                modelo: "EE-550W Bifacial",
                fornecedorId: 2,
                fornecedorNome: "EcoEnergy Brasil",
                potencia: 550,
                eficiencia: 21.8,
                preco: 1200.00,
                garantia: 30,
                dimensoes: "227 x 113 x 3.5",
                peso: 28.0,
                especificacoes: "Tecnologia bifacial, ganho adicional de até 30%"
            },
            {
                id: 3,
                modelo: "NS-320W Policristalina",
                fornecedorId: 3,
                fornecedorNome: "Nordeste Solar",
                potencia: 320,
                eficiencia: 17.2,
                preco: 650.00,
                garantia: 20,
                dimensoes: "195 x 99 x 4",
                peso: 20.0,
                especificacoes: "Boa relação custo-benefício, ideal para projetos residenciais"
            },
            {
                id: 4,
                modelo: "ST-500W Half-Cell",
                fornecedorId: 1,
                fornecedorNome: "SolarTech Solutions",
                potencia: 500,
                eficiencia: 21.0,
                preco: 950.00,
                garantia: 25,
                dimensoes: "210 x 105 x 4",
                peso: 25.0,
                especificacoes: "Tecnologia Half-Cell, menor resistência e maior eficiência"
            }
        ];

        let editandoFornecedor = null;
        let editandoPlaca = null;

        function formatarMoeda(valor) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor);
        }

        function mostrarTab(tab) {
            // Atualizar botões das tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`.tab:nth-child(${tab === 'fornecedores' ? '1' : '2'})`).classList.add('active');
            
            // Mostrar conteúdo da tab
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
        }

        function renderizarFornecedores() {
            const busca = document.getElementById('buscaFornecedor').value.toLowerCase();
            const regiao = document.getElementById('filtroRegiaoFornecedor').value;
            
            let filtrados = fornecedores;
            
            if (busca) {
                filtrados = filtrados.filter(f => 
                    f.nome.toLowerCase().includes(busca) ||
                    f.cidade.toLowerCase().includes(busca) ||
                    f.cnpj.includes(busca)
                );
            }
            
            if (regiao) {
                filtrados = filtrados.filter(f => f.regiao === regiao);
            }
            
            const container = document.getElementById('fornecedoresList');
            
            if (filtrados.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <h3>Nenhum fornecedor encontrado</h3>
                        <p>Tente ajustar os filtros ou cadastre um novo fornecedor</p>
                        <button class="btn btn-primary" onclick="abrirModalFornecedor()" style="margin-top: 15px;">
                            ➕ Cadastrar Primeiro Fornecedor
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = filtrados.map(fornecedor => `
                <div class="fornecedor-card">
                    <div class="fornecedor-header">
                        <div>
                            <div class="fornecedor-nome">${fornecedor.nome}</div>
                            <div style="color: #718096; font-size: 0.9rem;">CNPJ: ${fornecedor.cnpj}</div>
                        </div>
                        <div class="fornecedor-regiao">${fornecedor.regiao.toUpperCase()}</div>
                    </div>
                    
                    <div class="fornecedor-info">
                        📧 ${fornecedor.email}<br>
                        📱 ${fornecedor.telefone}<br>
                        📍 ${fornecedor.cidade}<br>
                        ${fornecedor.endereco ? `🏠 ${fornecedor.endereco}<br>` : ''}
                        ${fornecedor.observacoes ? `💬 ${fornecedor.observacoes}` : ''}
                    </div>
                    
                    <div class="fornecedor-stats">
                        <div class="stat-badge">
                            <div class="stat-number">${fornecedor.orcamentos}</div>
                            <div class="stat-label">Orçamentos</div>
                        </div>
                        <div class="stat-badge">
                            <div class="stat-number">${fornecedor.aprovacao}%</div>
                            <div class="stat-label">Aprovação</div>
                        </div>
                        <div class="stat-badge">
                            <div class="stat-number">${placasSolares.filter(p => p.fornecedorId === fornecedor.id).length}</div>
                            <div class="stat-label">Modelos</div>
                        </div>
                    </div>
                    
                    <div class="fornecedor-actions">
                        <button class="btn btn-primary btn-small" onclick="editarFornecedor(${fornecedor.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-warning btn-small" onclick="verPlacasFornecedor(${fornecedor.id})">
                            ⚡ Placas
                        </button>
                        <button class="btn btn-danger btn-small" onclick="excluirFornecedor(${fornecedor.id})">
                            🗑️ Excluir
                        </button>
                         <button class="btn btn-secondary btn-small" onclick="verPlacasFornecedor(${fornecedor.id})">
                            ⚡ Inversores
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function renderizarPlacas() {
            const busca = document.getElementById('buscaPlaca').value.toLowerCase();
            const fornecedor = document.getElementById('filtroFornecedorPlaca').value;
            const potencia = document.getElementById('filtroPotenciaPlaca').value;
            
            let filtradas = placasSolares;
            
            if (busca) {
                filtradas = filtradas.filter(p => 
                    p.modelo.toLowerCase().includes(busca) ||
                    p.fornecedorNome.toLowerCase().includes(busca)
                );
            }
            
            if (fornecedor) {
                filtradas = filtradas.filter(p => p.fornecedorNome === fornecedor);
            }
            
            if (potencia) {
                if (potencia === '100-300') {
                    filtradas = filtradas.filter(p => p.potencia >= 100 && p.potencia <= 300);
                } else if (potencia === '300-500') {
                    filtradas = filtradas.filter(p => p.potencia >= 300 && p.potencia <= 500);
                } else if (potencia === '500+') {
                    filtradas = filtradas.filter(p => p.potencia > 500);
                }
            }
            
            const container = document.getElementById('placasList');
            
            if (filtradas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>Nenhuma placa solar encontrada</h3>
                        <p>Tente ajustar os filtros ou cadastre um novo modelo</p>
                        <button class="btn btn-success" onclick="abrirModalPlaca()" style="margin-top: 15px;">
                            ⚡ Cadastrar Primeira Placa
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = filtradas.map(placa => `
                <div class="placa-item">
                    <div class="placa-header">
                        <div class="placa-nome">${placa.modelo}</div>
                        <div class="placa-fornecedor">${placa.fornecedorNome}</div>
                    </div>
                    
                    <div class="placa-specs">
                        <div class="spec-item">
                            <div class="spec-value">${placa.potencia}W</div>
                            <div class="spec-label">Potência</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${placa.eficiencia}%</div>
                            <div class="spec-label">Eficiência</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${formatarMoeda(placa.preco)}</div>
                            <div class="spec-label">Preço</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-value">${placa.garantia} anos</div>
                            <div class="spec-label">Garantia</div>
                        </div>
                        ${placa.peso ? `
                        <div class="spec-item">
                            <div class="spec-value">${placa.peso}kg</div>
                            <div class="spec-label">Peso</div>
                        </div>
                        ` : ''}
                        ${placa.dimensoes ? `
                        <div class="spec-item">
                            <div class="spec-value" style="font-size: 0.9rem;">${placa.dimensoes}cm</div>
                            <div class="spec-label">Dimensões</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${placa.especificacoes ? `
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <strong>Especificações:</strong><br>
                        <span style="color: #718096; font-size: 0.9rem;">${placa.especificacoes}</span>
                    </div>
                    ` : ''}
                    
                    <div class="placa-actions">
                        <button class="btn btn-primary btn-small" onclick="editarPlaca(${placa.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-warning btn-small" onclick="duplicarPlaca(${placa.id})">
                            📋 Duplicar
                        </button>
                        <button class="btn btn-danger btn-small" onclick="excluirPlaca(${placa.id})">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function atualizarFiltrosFornecedores() {
            // Atualizar filtro de fornecedores nas placas
            const filtroFornecedor = document.getElementById('filtroFornecedorPlaca');
            const placaFornecedor = document.getElementById('placaFornecedor');
            
            const opcoesFornecedores = fornecedores.map(f => 
                `<option value="${f.nome}">${f.nome}</option>`
            ).join('');
            
            if (filtroFornecedor) {
                const valorAtual = filtroFornecedor.value;
                filtroFornecedor.innerHTML = '<option value="">Todos os Fornecedores</option>' + opcoesFornecedores;
                filtroFornecedor.value = valorAtual;
            }
            
            if (placaFornecedor) {
                const valorAtual = placaFornecedor.value;
                placaFornecedor.innerHTML = '<option value="">Selecione...</option>' + opcoesFornecedores;
                placaFornecedor.value = valorAtual;
            }
        }

        // Funções dos Modais
        function abrirModalFornecedor(id = null) {
            editandoFornecedor = id;
            const modal = document.getElementById('modalFornecedor');
            const title = document.getElementById('modalFornecedorTitle');
            
            if (id) {
                const fornecedor = fornecedores.find(f => f.id === id);
                title.textContent = `Editar Fornecedor - ${fornecedor.nome}`;
                
                document.getElementById('fornecedorNome').value = fornecedor.nome;
                document.getElementById('fornecedorCnpj').value = fornecedor.cnpj;
                document.getElementById('fornecedorEmail').value = fornecedor.email;
                document.getElementById('fornecedorTelefone').value = fornecedor.telefone;
                document.getElementById('fornecedorRegiao').value = fornecedor.regiao;
                document.getElementById('fornecedorCidade').value = fornecedor.cidade;
                document.getElementById('fornecedorEndereco').value = fornecedor.endereco || '';
                document.getElementById('fornecedorObservacoes').value = fornecedor.observacoes || '';
            } else {
                title.textContent = 'Cadastrar Novo Fornecedor';
                document.getElementById('formFornecedor').reset();
            }
            
            modal.style.display = 'block';
        }

        function fecharModalFornecedor() {
            document.getElementById('modalFornecedor').style.display = 'none';
            document.getElementById('formFornecedor').reset();
            editandoFornecedor = null;
        }

        function salvarFornecedor() {
            const form = document.getElementById('formFornecedor');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const dadosFornecedor = {
                nome: document.getElementById('fornecedorNome').value,
                cnpj: document.getElementById('fornecedorCnpj').value,
                email: document.getElementById('fornecedorEmail').value,
                telefone: document.getElementById('fornecedorTelefone').value,
                regiao: document.getElementById('fornecedorRegiao').value,
                cidade: document.getElementById('fornecedorCidade').value,
                endereco: document.getElementById('fornecedorEndereco').value,
                observacoes: document.getElementById('fornecedorObservacoes').value,
                orcamentos: 0,
                aprovacao: 0
            };
            
            if (editandoFornecedor) {
                const index = fornecedores.findIndex(f => f.id === editandoFornecedor);
                fornecedores[index] = { ...fornecedores[index], ...dadosFornecedor };
                alert('✅ Fornecedor atualizado com sucesso!');
            } else {
                const novoId = Math.max(...fornecedores.map(f => f.id)) + 1;
                fornecedores.push({ id: novoId, ...dadosFornecedor });
                alert('✅ Fornecedor cadastrado com sucesso!');
            }
            
            fecharModalFornecedor();
            renderizarFornecedores();
            atualizarFiltrosFornecedores();
        }

        function editarFornecedor(id) {
            abrirModalFornecedor(id);
        }

        function excluirFornecedor(id) {
            const fornecedor = fornecedores.find(f => f.id === id);
            const placasDoFornecedor = placasSolares.filter(p => p.fornecedorId === id).length;
            
            let mensagem = `Tem certeza que deseja excluir o fornecedor "${fornecedor.nome}"?`;
            if (placasDoFornecedor > 0) {
                mensagem += `\n\n⚠️ ATENÇÃO: Este fornecedor possui ${placasDoFornecedor} modelo(s) de placa(s) cadastrado(s). Elas também serão excluídas.`;
            }
            
            if (confirm(mensagem)) {
                // Remover fornecedor
                const index = fornecedores.findIndex(f => f.id === id);
                fornecedores.splice(index, 1);
                
                // Remover placas do fornecedor
                for (let i = placasSolares.length - 1; i >= 0; i--) {
                    if (placasSolares[i].fornecedorId === id) {
                        placasSolares.splice(i, 1);
                    }
                }
                
                alert('✅ Fornecedor e suas placas foram excluídos com sucesso!');
                renderizarFornecedores();
                renderizarPlacas();
                atualizarFiltrosFornecedores();
            }
        }

        function verPlacasFornecedor(id) {
            const fornecedor = fornecedores.find(f => f.id === id);
            document.getElementById('filtroFornecedorPlaca').value = fornecedor.nome;
            mostrarTab('placas');
            renderizarPlacas();
        }

        function abrirModalPlaca(id = null) {
            editandoPlaca = id;
            const modal = document.getElementById('modalPlaca');
            const title = document.getElementById('modalPlacaTitle');
            
            atualizarFiltrosFornecedores();
            
            if (id) {
                const placa = placasSolares.find(p => p.id === id);
                title.textContent = `Editar Placa Solar - ${placa.modelo}`;
                
                document.getElementById('placaModelo').value = placa.modelo;
                document.getElementById('placaFornecedor').value = placa.fornecedorNome;
                document.getElementById('placaPotencia').value = placa.potencia;
                document.getElementById('placaEficiencia').value = placa.eficiencia;
                document.getElementById('placaPreco').value = placa.preco;
                document.getElementById('placaGarantia').value = placa.garantia;
                document.getElementById('placaDimensoes').value = placa.dimensoes || '';
                document.getElementById('placaPeso').value = placa.peso || '';
                document.getElementById('placaEspecificacoes').value = placa.especificacoes || '';
            } else {
                title.textContent = 'Cadastrar Nova Placa Solar';
                document.getElementById('formPlaca').reset();
            }
            
            modal.style.display = 'block';
        }

        function fecharModalPlaca() {
            document.getElementById('modalPlaca').style.display = 'none';
            document.getElementById('formPlaca').reset();
            editandoPlaca = null;
        }

        function salvarPlaca() {
            const form = document.getElementById('formPlaca');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const fornecedorNome = document.getElementById('placaFornecedor').value;
            const fornecedor = fornecedores.find(f => f.nome === fornecedorNome);
            
            if (!fornecedor) {
                alert('❌ Erro: Fornecedor não encontrado!');
                return;
            }
            
            const dadosPlaca = {
                modelo: document.getElementById('placaModelo').value,
                fornecedorId: fornecedor.id,
                fornecedorNome: fornecedor.nome,
                potencia: parseInt(document.getElementById('placaPotencia').value),
                eficiencia: parseFloat(document.getElementById('placaEficiencia').value),
                preco: parseFloat(document.getElementById('placaPreco').value),
                garantia: parseInt(document.getElementById('placaGarantia').value),
                dimensoes: document.getElementById('placaDimensoes').value,
                peso: parseFloat(document.getElementById('placaPeso').value) || null,
                especificacoes: document.getElementById('placaEspecificacoes').value
            };
            
            if (editandoPlaca) {
                const index = placasSolares.findIndex(p => p.id === editandoPlaca);
                placasSolares[index] = { ...placasSolares[index], ...dadosPlaca };
                alert('✅ Placa solar atualizada com sucesso!');
            } else {
                const novoId = Math.max(...placasSolares.map(p => p.id)) + 1;
                placasSolares.push({ id: novoId, ...dadosPlaca });
                alert('✅ Placa solar cadastrada com sucesso!');
            }
            
            fecharModalPlaca();
            renderizarPlacas();
            renderizarFornecedores(); // Atualizar contador de modelos
        }

        function editarPlaca(id) {
            abrirModalPlaca(id);
        }

        function duplicarPlaca(id) {
            const placa = placasSolares.find(p => p.id === id);
            const novoModelo = prompt(`Digite o novo nome do modelo:\n(Original: ${placa.modelo})`, `${placa.modelo} - Cópia`);
            
            if (novoModelo && novoModelo.trim()) {
                const novoId = Math.max(...placasSolares.map(p => p.id)) + 1;
                const novaPlaca = { ...placa, id: novoId, modelo: novoModelo.trim() };
                placasSolares.push(novaPlaca);
                
                alert('✅ Placa solar duplicada com sucesso!');
                renderizarPlacas();
                renderizarFornecedores();
            }
        }

        function excluirPlaca(id) {
            const placa = placasSolares.find(p => p.id === id);
            
            if (confirm(`Tem certeza que deseja excluir a placa "${placa.modelo}"?`)) {
                const index = placasSolares.findIndex(p => p.id === id);
                placasSolares.splice(index, 1);
                
                alert('✅ Placa solar excluída com sucesso!');
                renderizarPlacas();
                renderizarFornecedores();
            }
        }

        // Event Listeners
        document.getElementById('buscaFornecedor').addEventListener('input', renderizarFornecedores);
        document.getElementById('filtroRegiaoFornecedor').addEventListener('change', renderizarFornecedores);
        document.getElementById('buscaPlaca').addEventListener('input', renderizarPlacas);
        document.getElementById('filtroFornecedorPlaca').addEventListener('change', renderizarPlacas);
        document.getElementById('filtroPotenciaPlaca').addEventListener('change', renderizarPlacas);

        // Fechar modais ao clicar fora
        document.getElementById('modalFornecedor').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalFornecedor();
            }
        });

        document.getElementById('modalPlaca').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalPlaca();
            }
        });

        // Máscara para CNPJ
        document.getElementById('fornecedorCnpj').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value;
        });

        // Inicializar página
        renderizarFornecedores();
        renderizarPlacas();
        atualizarFiltrosFornecedores();