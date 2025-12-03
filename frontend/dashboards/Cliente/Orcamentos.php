<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
// Inclui configuração se necessário para BASE_URL, etc.
// require_once '../../../backend/config.php'; 
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitar Orçamento - Solar Smart</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/Orcamentos.css">
</head>

<body>
    <header class="header">
        <div class="container">
            <h1 class="logo"><i class="fas fa-solar-panel"></i> Solar Smart</h1>
            <nav class="nav">
                <a href="CadastrarImoveis.php" class="nav-link"><i class="fas fa-home"></i> Meus Imóveis</a>
                <a href="#" class="nav-link active"><i class="fas fa-calculator"></i> Orçamentos</a>
                <a href="MeusOrcamentos.php" class="nav-link"><i class="fas fa-list-alt"></i> Meus Pedidos</a>
                <a href="../../../backend/login-cadastro/sessao_destroy.php" class="btn-sair"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2><i class="fas fa-file-invoice-dollar"></i> Orçamentos de Energia Solar</h2>
                <p>Simule e analise as melhores propostas do mercado para o seu imóvel.</p>
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
                    <p>Escolha o imóvel para o qual deseja solicitar orçamentos</p>

                    <div id="properties-selector" class="properties-selector"></div>

                    <div id="paginacaoContainer" class="pagination-controls"></div>

                    <div id="empty-properties" class="empty-state" style="display: none;">
                        <i class="fas fa-exclamation-circle empty-icon"></i>
                        <h4>Nenhum imóvel cadastrado</h4>
                        <p>Cadastre um imóvel para continuar.</p>
                        <button class="btn btn-primary" onclick="window.location.href='CadastrarImoveis.php'">Cadastrar</button>
                    </div>

                    <div id="low-consumption-warning" class="warning-card" style="display: none;">
                    </div>
                </div>
            </section>

            <section id="step-2" class="step-content">
                <div class="budgets-section">
                    <div id="selected-property-info"></div>

                    <div class="section-header">
                        <h3><i class="fas fa-clipboard-list"></i> Propostas Recomendadas</h3>
                        <p>Baseado no seu consumo e região, selecionamos as melhores ofertas.</p>
                    </div>

                    <div class="budgets-grid" id="budgets-grid">
                        <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--cinza-claro);">
                            <i class="fas fa-spinner fa-spin fa-2x"></i><br>Buscando as melhores ofertas...
                        </div>
                    </div>

                    <div class="step-actions" style="text-align: center; margin-top: 30px;">
                        <button class="btn btn-secondary" onclick="goToStep(1)">
                            <i class="fas fa-arrow-left"></i> Voltar para Imóveis
                        </button>
                    </div>
                </div>
            </section>

            <section id="step-3" class="step-content">
                <div class="confirmation-section">
                    <div class="confirmation-header">
                        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                    </div>

                    <div id="approved-budget-info"></div>

                    <div class="step-actions" style="display: flex; justify-content: center; gap: 20px; margin-top: 30px;">
                        <button class="btn btn-secondary" onclick="startNewQuote()">
                            <i class="fas fa-plus"></i> Novo Orçamento
                        </button>
                        <button class="btn btn-primary" onclick="window.location.href='MeusOrcamentos.php'">
                            <i class="fas fa-list-alt"></i> Ver Meus Pedidos
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <div id="modal-overlay" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <h4 id="modal-title">Título do Modal</h4>
                <button id="modal-close" class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" id="modal-body-content">
            </div>
            <div class="modal-actions" id="modal-footer-actions">
                <button id="modal-cancel" class="btn btn-secondary">Cancelar</button>
                <button id="modal-confirm" class="btn btn-success">Confirmar</button>
            </div>
        </div>
    </div>

    <script src="../../JS/Cliente/Orcamento.js"></script>
</body>

</html>