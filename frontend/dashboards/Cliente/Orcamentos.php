<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitar Orçamento - Solar Smart</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/Orcamentos.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">Solar Smart</h1>
            <nav class="nav">
                <?php require_once '../../../backend/config.php'; ?>
                <a href="<?php echo BASE_URL; ?>/backend/login-cadastro/sessao_destroy.php">Sair</a>
                <a href="CadastrarImoveis.php" class="nav-link" id="nav-imoveis">Meus Imóveis</a>
                <a href="#" class="nav-link active">Orçamentos</a>
                <a href="MeusOrcamentos.php" class="nav-link" id="nav-meus-orcamentos">Meus orçamentos</a>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2><i class="fas fa-file-invoice-dollar"></i> Orçamentos de Energia Solar</h2>
                <p>Analise as melhores propostas para seu imóvel</p>
            </div>

            <div class="progress-steps">
                <div class="step active" data-step="1">
                    <div class="step-circle">1</div>
                    <div class="step-label">Selecionar Imóvel</div>
                </div>
                <div class="step-line"></div>
                <div class="step" data-step="2">
                    <div class="step-circle">2</div>
                    <div class="step-label">Analisar Propostas</div>
                </div>
                <div class="step-line"></div>
                <div class="step" data-step="3">
                    <div class="step-circle">3</div>
                    <div class="step-label">Confirmação</div>
                </div>
            </div>

            <section id="step-1" class="step-content active">
                <div class="selection-card">
                    <h3><i class="fas fa-home"></i> Selecione o Imóvel</h3>
                    <p>Escolha o imóvel para o qual deseja solicitar orçamentos de energia solar</p>
                    
                    <div id="properties-selector" class="properties-selector">
                        </div>
                    
                    <div id="empty-properties" class="empty-state" style="display: none;">
                        <i class="fas fa-exclamation-circle empty-icon"></i>
                        <h4>Nenhum imóvel cadastrado</h4>
                        <p>Você precisa cadastrar pelo menos um imóvel antes de solicitar orçamentos</p>
                        <button class="btn btn-primary" onclick="window.location.href='CadastrarImoveis.php'">
                            <i class="fas fa-plus"></i> Cadastrar Imóvel
                        </button>
                    </div>
                    
                    <div id="low-consumption-warning" class="warning-card" style="display: none;">
                        <i class="fas fa-exclamation-triangle warning-icon"></i>
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

            <section id="step-2" class="step-content">
                <div class="budgets-section">
                    <div class="section-header">
                        <h3><i class="fas fa-clipboard-list"></i> Propostas Disponíveis</h3>
                        <p>Analisamos o mercado e selecionamos as 3 melhores propostas para seu imóvel</p>
                    </div>
                    
                    <div class="selected-property-info" id="selected-property-info">
                        </div>
                    
                    <div class="budgets-grid" id="budgets-grid">
                        </div>
                    
                    <div class="step-actions">
                        <button class="btn btn-secondary" onclick="goToStep(1)">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </button>
                    </div>
                </div>
            </section>

            <section id="step-3" class="step-content">
                <div class="confirmation-section">
                    <div class="confirmation-header">
                        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                        <h3>Orçamento Aprovado!</h3>
                        <p>Seu orçamento foi enviado para validação do administrador</p>
                    </div>
                    
                    <div class="approved-budget-info" id="approved-budget-info">
                        </div>
                    
                    <div class="status-timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-icon"><i class="fas fa-check"></i></div>
                            <div class="timeline-content">
                                <h4>Orçamento Aprovado</h4>
                                <p>Você aprovou a proposta em <span id="approval-date"></span></p>
                            </div>
                        </div>
                        <div class="timeline-item current">
                            <div class="timeline-icon"><i class="fas fa-hourglass-half"></i></div>
                            <div class="timeline-content">
                                <h4>Aguardando Validação</h4>
                                <p>O administrador está analisando sua solicitação</p>
                            </div>
                        </div>
                        <div class="timeline-item pending">
                            <div class="timeline-icon"><i class="fas fa-clock"></i></div>
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
                        <button class="btn btn-primary" onclick="window.location.href='CadastrarImoveis.php'">
                            Voltar aos Imóveis
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </main>

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
                        </div>
                    <div class="modal-warning">
                        <strong><i class="fas fa-exclamation-triangle"></i> Atenção:</strong> Após a aprovação, o orçamento será enviado para validação do administrador e você não poderá mais alterar sua escolha.
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button id="modal-cancel" class="btn btn-secondary">Cancelar</button>
                <button id="modal-confirm" class="btn btn-success"><i class="fas fa-check"></i> Confirmar Aprovação</button>
            </div>
        </div>
    </div>

    <script src="../../JS/Cliente/Orcamento.js"></script>
</body>
</html>