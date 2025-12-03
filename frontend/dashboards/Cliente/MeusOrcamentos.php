<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Orçamentos - Solar Smart</title>
    <link rel="stylesheet" href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/MeusOrcamentos.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo"><i class="fas fa-solar-panel"></i> Solar Smart</h1>
            <nav class="nav">
                <?php require_once '../../../backend/config.php'; ?>
                <a href="CadastrarImoveis.php" class="nav-link" id="nav-imoveis">Meus Imóveis</a>
                <a href="Orcamentos.php" class="nav-link">Orçamentos</a>
                <a href="#" class="nav-link active">Meus Pedidos</a>
                <a href="<?php echo BASE_URL; ?>/backend/login-cadastro/sessao_destroy.php" class="btn-sair">Sair</a>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2><i class="fas fa-list-alt"></i> Gerenciamento de Pedidos</h2>
                <p>Acompanhe o histórico das suas solicitações aprovadas e recusadas.</p>
            </div>

            <details class="accordion-wrapper approved-wrapper" open>
                <summary class="accordion-header">
                    <div class="acc-title">
                        <i class="fas fa-check-circle" style="color: var(--verde-sucesso);"></i> 
                        Orçamentos Aprovados
                    </div>
                    <i class="fas fa-chevron-down arrow"></i>
                </summary>
                <div class="accordion-content">
                    <div id="approved-list" class="budget-grid">
                        </div>
                    <div id="pagination-approved" class="pagination-controls"></div>
                    
                    <div id="empty-approved" class="empty-state" style="display: none;">
                        <i class="fas fa-check-circle empty-icon" style="color: var(--borda-suave);"></i>
                        <h4>Nenhum orçamento aprovado</h4>
                        <p>Você ainda não aprovou nenhuma proposta.</p>
                    </div>
                </div>
            </details>

            <details class="accordion-wrapper denied-wrapper">
                <summary class="accordion-header">
                    <div class="acc-title">
                        <i class="fas fa-times-circle" style="color: var(--vermelho-erro);"></i> 
                        Orçamentos Recusados
                    </div>
                    <i class="fas fa-chevron-down arrow"></i>
                </summary>
                <div class="accordion-content">
                    <div id="denied-list" class="budget-grid">
                        </div>
                    <div id="pagination-denied" class="pagination-controls"></div>

                    <div id="empty-denied" class="empty-state" style="display: none;">
                        <i class="fas fa-ban empty-icon" style="color: var(--borda-suave);"></i>
                        <h4>Nenhum orçamento recusado</h4>
                        <p>Todas as suas propostas ativas estão em análise ou aprovadas.</p>
                    </div>
                </div>
            </details>

        </div>
    </main>

    <script src="../../JS/Cliente/meus_orcamentos.js"></script>
</body>
</html>