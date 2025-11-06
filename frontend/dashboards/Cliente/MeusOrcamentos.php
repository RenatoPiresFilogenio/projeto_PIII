<?php
// Inclua aqui seu script de proteção de sessão de CLIENTE
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale-1.0">
    <title>Meus Orçamentos - Solar System</title>
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/Orcamentos.css">
    <link rel="stylesheet" href="../../css/Dashboards/editarPages/aprovar_orcamento.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">☀️ Solar System</h1>
            <nav class="nav">
                <?php require_once '../../../backend/config.php'; ?>
                <a href="<?php echo BASE_URL; ?>/backend/login-cadastro/sessao_destroy.php">Sair</a>
                <a href="../../css/Dashboards/Cliente/Orcamentos.css" class="nav-link" id="nav-imoveis">Meus Imóveis</a>
                <a href="#" class="nav-link active">Orçamentos</a>
                <a href="MeusOrcamentos.php" class="nav-link" id="nav-orcamentos">Meus orçamentos</a>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2>📊 Gerenciamento de Orçamentos</h2>
                <p>Acompanhe o status de todas as suas solicitações.</p>
            </div>

            <section class="budget-section">
                <h3>⚠️ Pendentes de Validação</h3>
                <p>Estes orçamentos foram enviados e aguardam a aprovação do administrador.</p>
                <div id="pending-budgets-list" class="admin-budgets-grid">
                    
                    <div id="empty-pending-message" class="empty-state" style="display: none;">
                        <h4>Nenhum orçamento pendente</h4>
                        <p>Você não possui solicitações aguardando validação.</p>
                    </div>
                </div>
            </section>

            <section class="budget-section">
                <h3>📚 Histórico de Orçamentos</h3>
                <p>Suas solicitações que já foram processadas pelo administrador.</p>
                <div id="history-budgets-list" class="admin-budgets-grid historical">
                   
                    <div id="empty-history-message" class="empty-state" style="display: none;">
                        <h4>Nenhum histórico</h4>
                        <p>Você ainda não tem orçamentos aprovados ou negados.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <script src="../../JS/Cliente/meus_orcamentos.js"></script>
</body>
</html>