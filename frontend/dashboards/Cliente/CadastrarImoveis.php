<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Imóveis - Solar Smart</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../../css/Dashboards/Cliente/CadastroImoveis.css">
</head>

<body>
    <header class="header">
        <div class="container">
            <h1 class="logo"><i class="fas fa-solar-panel"></i> Solar Smart</h1>
            <nav class="nav">
                <a href="CadastrarImoveis.php active" class="nav-link"><i class="fas fa-home"></i> Meus Imóveis</a>
                <a href="Orcamentos.php" class="nav-link"><i class="fas fa-calculator"></i> Orçamentos</a>
                <a href="MeusOrcamentos.php" class="nav-link"><i class="fas fa-list-alt"></i> Meus Pedidos</a>
                <a href="../../../backend/login-cadastro/sessao_destroy.php" class="btn-sair"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </nav>
        </div>
    </header>
    <main class="main">
        <div class="container">
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2><i class="fas fa-home"></i> Gerenciar Imóveis</h2>
                <div class="header-actions">
                    <button id="btn-solicitar-orcamento" class="btn btn-success-pill">
                        <i class="fas fa-file-invoice-dollar"></i> Solicitar Orçamento
                    </button>
                </div>
            </div>

            <section class="properties-section">
                <div id="properties-list" class="properties-grid">
                </div>

                <div id="paginacaoContainer" class="pagination-controls">
                </div>

                <div id="empty-state" class="empty-state" style="display: none;">
                    <i class="fas fa-house-damage empty-icon"></i>
                    <h4>Nenhum imóvel cadastrado</h4>
                    <p>Cadastre seu primeiro imóvel abaixo para começar.</p>
                </div>
            </section>

            <hr class="divider">

            <details class="accordion-wrapper" id="accordion-cadastro">
                <summary class="accordion-header">
                    <span class="acc-title"><i class="fas fa-plus-circle"></i> Cadastrar Novo Imóvel</span>
                    <i class="fas fa-chevron-down arrow"></i>
                </summary>

                <div class="accordion-content">
                    <form id="imovel-form" action="../../../backend/ClienteBackEnd/cadastrarimoveis.php" method="POST">
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label for="nome">Nome do Imóvel *</label>
                                <input type="text" id="nome" name="nome" class="form-input" placeholder="Ex: Minha Casa, Sítio..." required>
                                <span class="error-message" id="error-nome"></span>
                            </div>

                            <div class="form-group">
                                <label for="regiao">Região *</label>
                                <select id="regiao" name="regiao" class="form-input" required>
                                    <option value="">Selecione...</option>
                                    <option value="Norte">Norte</option>
                                    <option value="Nordeste">Nordeste</option>
                                    <option value="Centro-Oeste">Centro-Oeste</option>
                                    <option value="Sudeste">Sudeste</option>
                                    <option value="Sul">Sul</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="estado">Estado *</label>
                                <select id="estado" name="estado" class="form-input" required disabled>
                                    <option value="">Selecione a região...</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="cidade">Cidade *</label>
                                <input type="text" id="cidade" name="cidade" class="form-input" required>
                            </div>

                            <div class="form-group">
                                <label for="bairro">Bairro *</label>
                                <input type="text" id="bairro" name="bairro" class="form-input" required>
                            </div>

                            <div class="form-group full-width">
                                <label for="rua">Rua/Avenida *</label>
                                <input type="text" id="rua" name="rua" class="form-input" required>
                            </div>

                            <div class="form-group">
                                <label for="numero">Número *</label>
                                <input type="number" id="numero" name="numero" class="form-input" required>
                            </div>

                            <div class="form-group">
                                <label for="cep">CEP *</label>
                                <input type="text" id="cep" name="cep" class="form-input" maxlength="9" required>
                            </div>

                            <div class="form-group full-width highlight-group">
                                <label for="consumo"><i class="fas fa-bolt"></i> Consumo Mensal (kWh) *</label>
                                <input type="number" id="consumo" name="consumo" class="form-input" placeholder="Ex: 350" min="1" required>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" id="btn-cancelar" class="btn btn-secondary" style="display: none;">Cancelar Edição</button>
                            <button type="submit" id="btn-submit" class="btn btn-primary">
                                <span class="btn-text">Salvar Imóvel</span>
                                <span class="btn-loading" style="display: none;"><i class="fas fa-spinner fa-spin"></i></span>
                            </button>
                        </div>
                    </form>
                </div>
            </details>

        </div>
    </main>

    <div id="modal-overlay" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <h4>Confirmar Exclusão</h4>
                <button id="modal-close" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p id="modal-message">Tem certeza que deseja excluir este imóvel?</p>
            </div>
            <div class="modal-actions">
                <button id="modal-cancel" class="btn btn-secondary">Cancelar</button>
                <button id="modal-confirm" class="btn btn-danger">Excluir</button>
            </div>
        </div>
    </div>

    <script>
        // Máscara CEP simples
        document.getElementById('cep').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5, 8);
            e.target.value = value;
        });
    </script>
    <script src="../../JS/Cliente/exibirImoveis.js"></script>
</body>

</html>