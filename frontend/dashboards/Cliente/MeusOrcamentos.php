<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Orçamentos - Solar Smart</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/MeusOrcamentos.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">Solar Smart</h1>
            <nav class="nav">
                <?php require_once '../../../backend/config.php'; ?>
                <a href="<?php echo BASE_URL; ?>/backend/login-cadastro/sessao_destroy.php">Sair</a>
                <a href="CadastrarImoveis.php" class="nav-link" id="nav-imoveis">Meus Imóveis</a>
                <a href="Orcamentos.php" class="nav-link">Orçamentos</a>
                <a href="#" class="nav-link active" id="nav-meus-orcamentos">Meus orçamentos</a>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2><i class="fas fa-file-invoice-dollar"></i> Gerenciamento de Orçamentos</h2>
                <p>Acompanhe o status de todas as suas solicitações.</p>
            </div>

            <section class="budget-section">
                <h3><i class="fas fa-hourglass-half"></i> Pendentes de Validação</h3>
                <p>Estes orçamentos foram enviados e aguardam a aprovação do administrador.</p>
                <div id="pending-budgets-list" class="admin-budgets-grid">
                    
                    <div id="empty-pending-message" class="empty-state" style="display: none;">
                        <i class="fas fa-inbox empty-icon"></i>
                        <h4>Nenhum orçamento pendente</h4>
                        <p>Você não possui solicitações aguardando validação.</p>
                    </div>
                </div>
            </section>

            <section class="budget-section">
                <h3><i class="fas fa-history"></i> Histórico de Orçamentos</h3>
                <p>Suas solicitações que já foram processadas pelo administrador.</p>
                
                <div class="filter-wrapper">
                    <label for="filtro-historico">Filtrar por:</label>
                    <select id="filtro-historico" class="filter-select">
                        <option value="todos">Todos</option>
                        <option value="approved">Aprovados</option>
                        <option value="denied">Recusados por Mim</option>
                        <option value="rejeitado">Rejeitados pelo Admin</option>
                    </select>
                </div>

                <div id="history-budgets-list" class="admin-budgets-grid historical">
                    
                    <div id="empty-history-message" class="empty-state" style="display: none;">
                        <i class="fas fa-archive empty-icon"></i>
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