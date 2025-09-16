<?php
require_once './php/database.php';

class criarUsuarioCliente
{
    private Database $db;
    private string $nome;
    private string $email;
    private string $senha;
    private string $telefone;

    public function __construct(Database $db, $nome, $email, $senha, $telefone)
    {
        $this->db = $db;
        $this->nome = $nome;
        $this->email = $email;
        $this->senha = $senha;
        $this->telefone = $telefone;
    }

    public function cadastrarUsuario()
    {
        try {
            $pdo = $this->db->connect();

            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, telefone) VALUES (:nome, :email, :senha, :telefone)");
            $stmt->bindParam(':nome', $this->nome);
            $stmt->bindParam(':email', $this->email);

            $hash = password_hash($this->senha, PASSWORD_DEFAULT);
            $stmt->bindParam(':senha', $hash);

            $stmt->bindParam(':telefone', $this->telefone);
            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Usuário cadastrado com sucesso!'
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erro ao cadastrar: ' . $e->getMessage()
            ];
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $confirmaSenha = $_POST['confirmaSenha'] ?? '';

    $database = new Database();
    $criarUsuario = new criarUsuarioCliente($database, $nome, $email, $senha, $telefone);

    $resultado = $criarUsuario->cadastrarUsuario();

    if ($resultado['success']) {
        header("Location: ../../../login.html?status=sucesso&msg=Conta+criada+com+sucesso");
        exit;
    } else {
        header("Location: ../../../login.html?status=falha+ao+criar+conta");
        exit;
    }
}
