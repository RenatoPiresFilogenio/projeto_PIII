<?php
// simulação de um banco de dados de usuários temporários


return [
    [
        'nome' => 'Lucas',
        'email' => 'lucas@example.com',
        'senha' => password_hash('12345', PASSWORD_DEFAULT), // senha criptografada
        'tipo_usuario' => 0
    ],
    [
        'nome' => 'Admin',
        'email' => 'admin',
        'senha' => password_hash('admin', PASSWORD_DEFAULT),
        'tipo_usuario' => 1
    ]
];
