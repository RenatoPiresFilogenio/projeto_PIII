<?php
require(__DIR__ . '/../../../backend/login-cadastro/sessao_protegida.php');
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Imóveis - Solar Smart</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <link rel="stylesheet" href="../../css/Dashboards/Cliente/CadastroImoveis.css">
</head>

<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">Solar Smart</h1>
            <nav class="nav">
                <?php require_once '../../../backend/config.php'; ?>
                <a href="<?php echo BASE_URL; ?>/backend/login-cadastro/sessao_destroy.php">Sair</a>
                <a href="#" class="nav-link active">Meus Imóveis</a>
                <a href="Orcamentos.php" class="nav-link" id="nav-orcamentos">Orçamentos</a>
                <a href="MeusOrcamentos.php" class="nav-link" id="nav-meus-orcamentos">Meus orçamentos</a>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div id="toast" class="toast"></div>

            <div class="page-header">
                <h2><i class="fas fa-home"></i> Gerenciar Imóveis</h2>
                <p>Cadastre e gerencie seus imóveis para simulações de energia solar</p>
            </div>

            <form id="imovel-form" action="../../../backend/ClienteBackEnd/cadastrarimoveis.php" method="POST">
                <section class="form-section">
                    <div class="form-card">
                        <h3 id="form-title">Cadastrar Novo Imóvel</h3>

                        <div class="form-group">
                            <label for="nome">Nome do Imóvel *</label>
                            <input type="text" id="nome" name="nome" placeholder="Ex: Casa Principal, Apartamento Centro" required>
                            <span class="error-message" id="error-nome"></span>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="rua">Rua/Avenida *</label>
                                <input type="text" id="rua" name="rua" placeholder="Rua das Flores" required>
                                <span class="error-message" id="error-rua"></span>
                            </div>
                            <div class="form-group">
                                <label for="numero">Número *</label>
                                <input type="number" id="numero" name="numero" placeholder="123" min="1" required>
                                <span class="error-message" id="error-numero"></span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="regiao">Região *</label>
                                <select id="regiao" name="regiao" class="input" required>
                                    <option value="">Selecione a região</option>
                                    <option value="Norte">Norte</option>
                                    <option value="Nordeste">Nordeste</option>
                                    <option value="Centro-Oeste">Centro-Oeste</option>
                                    <option value="Sudeste">Sudeste</option>
                                    <option value="Sul">Sul</option>
                                </select>
                                <span class="error-message" id="error-regiao"></span>
                            </div>
                            <div class="form-group">
                                <label for="estado">Estado *</label>
                                <select id="estado" name="estado" class="input" required disabled>
                                    <option value="">Selecione a região primeiro</option>
                                </select>
                                <span class="error-message" id="error-estado"></span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="cidade">Cidade *</label>
                                <input type="text" id="cidade" name="cidade" placeholder="São Paulo" required>
                                <span class="error-message" id="error-cidade"></span>
                            </div>
                            <div class="form-group">
                                <label for="bairro">Bairro *</label>
                                <input type="text" id="bairro" name="bairro" placeholder="Centro" required>
                                <span class="error-message" id="error-bairro"></span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="cep">CEP *</label>
                                <input type="text" id="cep" name="cep" placeholder="12345-678" maxlength="9" required>
                                <span class="error-message" id="error-cep"></span>
                            </div>
                            <div class="form-group">
                                <label for="consumo">Consumo Mensal (kWh) *</label>
                                <input type="number" id="consumo" name="consumo" placeholder="350" min="1" required>
                                <span class="error-message" id="error-consumo"></span>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" id="btn-cancelar" class="btn btn-secondary" style="display: none;">Cancelar</button>
                            <button type="submit" id="btn-submit" class="btn btn-primary">
                                <span class="btn-text">Cadastrar Imóvel</span>
                                <span class="btn-loading" style="display: none;">Salvando...</span>
                            </button>
                        </div>

                    </div>
                </section>
            </form>


            <section class="properties-section">
                <div class="section-header">
                    <h3><i class="fas fa-list-alt"></i> Imóveis Cadastrados</h3>
                    <button id="btn-solicitar-orcamento" class="btn btn-success">
                        <i class="fas fa-dollar-sign"></i> Solicitar Orçamento
                    </button>
                </div>

                <div id="properties-list" class="properties-grid">
                </div>

                <div id="empty-state" class="empty-state">
                    <i class="fas fa-home empty-icon"></i>
                    <h4>Nenhum imóvel cadastrado</h4>
                    <p>Cadastre seu primeiro imóvel para começar a simular orçamentos de energia solar</p>
                </div>
            </section>
        </div>
    </main>

    <div id="modal-overlay" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <h4 id="modal-title"><i class="fas fa-exclamation-triangle"></i> Confirmar Exclusão</h4>
                <button id="modal-close" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p id="modal-message">Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.</p>
            </div>
            <div class="modal-actions">
                <button id="modal-cancel" class="btn btn-secondary">Cancelar</button>
                <button id="modal-confirm" class="btn btn-danger">
                    <i class="fas fa-trash-alt"></i> Excluir
                </button>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('cep').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.slice(0, 5) + '-' + value.slice(5, 8);
            }
            e.target.value = value;
        });
    </script>

    <script src="../../JS/Cliente/exibirImoveis.js"></script>
</body>

</html>