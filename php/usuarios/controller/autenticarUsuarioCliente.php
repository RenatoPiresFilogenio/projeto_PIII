<?php

require_once './php/database.php';

class autenticarUsuarioCliente
{
    private $db;
    private $email;
    private $senha;

    public function __construct($db, $email, $senha)
    {
        $this->db = $db;
        $this->email = $email;
        $this->senha = $senha;
    }

    public function autenticarUsuario()
    {
        try {
            $pdo = $this->db->connect();

            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email");
            $stmt->bindParam(':email', $this->email);
            $stmt->execute();

            $usuario = $stmt->fetch();

            if (!$usuario) {
                return [
                    'success' => false,
                    'message' => 'Email não cadastrado.'
                ];
            }

            if (!password_verify($this->senha, $usuario['senha'])) {
                return [
                    'success' => false,
                    'message' => 'Senha incorreta.'
                ];
            }

            return [
                'success' => true,
                'message' => 'Login realizado com sucesso!',
                'usuario' => $usuario
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erro ao autenticar: ' . $e->getMessage()
            ];
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $database = new Database();
    $login = new autenticarUsuarioCliente($database, $email, $senha);

    $resultado = $login->autenticarUsuario();

    if ($resultado['success']) {
        // Redireciona com mensagem de sucesso
        header("Location: ../../../dashboard.html?status=sucesso&msg=" . urlencode($resultado['message']));
        exit;
    } else {
        // Redireciona de volta para login com erro
        header("Location: ../../../login.html?status=erro&msg=" . urlencode($resultado['message']));
        exit;
    }
}
