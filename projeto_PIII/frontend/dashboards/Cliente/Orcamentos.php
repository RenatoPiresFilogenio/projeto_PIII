// Validação da sessão (impedir acesso sem login)
<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamentos - Sistema Solar</title>
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/Orcamentos.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <h1 class="logo">☀️ Solar System</h1>
            <nav class="nav">
                <?php require_once '../../../backend/config.php'; ?>
                <a href="<?php echo BASE_URL; ?>/backend/login-cadastro/sessao_destroy.php">Sair</a>
                <a href="../../../frontend/dashboards/Cliente/CadastrarImoveis.html" class="nav-link" id="nav-imoveis">Meus Imóveis</a>
                <a href="#" class="nav-link active">Orçamentos</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <!-- Toast Notifications -->
            <div id="toast" class="toast"></div>

            <!-- Page Header -->
            <div class="page-header">
                <h2>💰 Orçamentos de Energia Solar</h2>
                <p>Analise as melhores propostas para seu imóvel</p>
            </div>

            <!-- Progress Steps -->
            <div class="progress-steps">
                <div class="step active" data-step="1">
                    <div class="step-circle">1</div>
                    <div class="step-label">Selecionar Imóvel</div>
                </div>
                <div class="step" data-step="2">
                    <div class="step-circle">2</div>
                    <div class="step-label">Analisar Propostas</div>
                </div>
                <div class="step" data-step="3">
                    <div class="step-circle">3</div>
                    <div class="step-label">Confirmação</div>
                </div>
            </div>

            <!-- Step 1: Property Selection -->
            <section id="step-1" class="step-content active">
                <div class="selection-card">
                    <h3>🏠 Selecione o Imóvel</h3>
                    <p>Escolha o imóvel para o qual deseja solicitar orçamentos de energia solar</p>
                    
                    <div id="properties-selector" class="properties-selector">
                        <!-- Properties will be loaded here -->
                    </div>
                    
                    <div id="empty-properties" class="empty-state">
                        <div class="empty-icon">🏠</div>
                        <h4>Nenhum imóvel cadastrado</h4>
                        <p>Você precisa cadastrar pelo menos um imóvel antes de solicitar orçamentos</p>
                        <button class="btn btn-primary" onclick="window.location.href='index.html'">
                            Cadastrar Imóvel
                        </button>
                    </div>
                    
                    <!-- Low consumption warning -->
                    <div id="low-consumption-warning" class="warning-card" style="display: none;">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-content">
                            <h4>Consumo Baixo Detectado</h4>
                            <p>Seu consumo mensal é baixo (<span id="consumption-value"></span> kWh). O sistema solar pode não ser necessário ou economicamente viável para este imóvel.</p>
                            <div class="warning-actions">
                                <button class="btn btn-secondary" onclick="backToPropertySelection()">Escolher Outro Imóvel</button>
                                <button class="btn btn-primary" onclick="proceedWithLowConsumption()">Continuar Mesmo Assim</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Step 2: Budget Analysis -->
            <section id="step-2" class="step-content">
                <div class="budgets-section">
                    <div class="section-header">
                        <h3>📊 Propostas Disponíveis</h3>
                        <p>Analisamos o mercado e selecionamos as 3 melhores propostas para seu imóvel</p>
                    </div>
                    
                    <div class="selected-property-info" id="selected-property-info">
                        <!-- Selected property info will be displayed here -->
                    </div>
                    
                    <div class="budgets-grid" id="budgets-grid">
                        <!-- Budget cards will be generated here -->
                    </div>
                    
                    <div class="step-actions">
                        <button class="btn btn-secondary" onclick="goToStep(1)">
                            ← Voltar
                        </button>
                    </div>
                </div>
            </section>

            <!-- Step 3: Confirmation -->
            <section id="step-3" class="step-content">
                <div class="confirmation-section">
                    <div class="confirmation-header">
                        <div class="success-icon">✅</div>
                        <h3>Orçamento Aprovado!</h3>
                        <p>Seu orçamento foi enviado para validação do administrador</p>
                    </div>
                    
                    <div class="approved-budget-info" id="approved-budget-info">
                        <!-- Approved budget details will be displayed here -->
                    </div>
                    
                    <div class="status-timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-icon">✅</div>
                            <div class="timeline-content">
                                <h4>Orçamento Aprovado</h4>
                                <p>Você aprovou a proposta em <span id="approval-date"></span></p>
                            </div>
                        </div>
                        <div class="timeline-item current">
                            <div class="timeline-icon">⏳</div>
                            <div class="timeline-content">
                                <h4>Aguardando Validação</h4>
                                <p>O administrador está analisando sua solicitação</p>
                            </div>
                        </div>
                        <div class="timeline-item pending">
                            <div class="timeline-icon">⏱️</div>
                            <div class="timeline-content">
                                <h4>Confirmação Final</h4>
                                <p>Em breve você poderá confirmar ou cancelar</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="step-actions">
                        <button class="btn btn-secondary" onclick="startNewQuote()">
                            Novo Orçamento
                        </button>
                        <button class="btn btn-primary" onclick="window.location.href='index.html'">
                            Voltar aos Imóveis
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <!-- Confirmation Modal -->
    <div id="modal-overlay" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <h4 id="modal-title">Confirmar Aprovação</h4>
                <button id="modal-close" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div id="modal-message">
                    <p>Tem certeza que deseja aprovar este orçamento?</p>
                    <div class="modal-budget-summary" id="modal-budget-summary">
                        <!-- Budget summary will be inserted here -->
                    </div>
                    <div class="modal-warning">
                        <strong>⚠️ Atenção:</strong> Após a aprovação, o orçamento será enviado para validação do administrador e você não poderá mais alterar sua escolha nesta etapa.
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button id="modal-cancel" class="btn btn-secondary">Cancelar</button>
                <button id="modal-confirm" class="btn btn-success">Confirmar Aprovação</button>
            </div>
        </div>
    </div>

    <script src="../../JS/Cliente/Orcamento.js"></script>
</body>
</html>