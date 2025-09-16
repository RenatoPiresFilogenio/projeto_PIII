<?php
// Database.php - Classe para conexão e operações do banco

require_once 'config.php';

class Database
{
    private $host;
    private $dbname;
    private $username;
    private $password;
    private $pdo;

    public function __construct()
    {
        $this->host = DB_HOST;
        $this->dbname = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
    }

    /**
     * Conecta com o banco de dados PostgreSQL
     */
    public function connect()
    {
        if ($this->pdo == null) {
            // DSN do PostgreSQL
            $dsn = "pgsql:host={$this->host};dbname={$this->dbname}";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];

            try {
                $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                die("Erro na conexão: " . $e->getMessage());
            }
        }

        return $this->pdo;
    }

    // (todo o resto da sua classe pode ficar igual: select, insert, execute, etc.)
}
