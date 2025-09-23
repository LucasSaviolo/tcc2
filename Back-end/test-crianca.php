<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔍 Testando Cadastro de Criança sem Campo Idade\n";
echo "================================================\n\n";

$baseUrl = 'http://localhost:8000/api';

// 1. Fazer login
echo "1. Fazendo login...\n";
$loginData = [
    'email' => 'admin@teste.com',
    'password' => 'password'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/auth/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "❌ Erro no login: HTTP $httpCode\n";
    echo $response . "\n";
    exit(1);
}

$loginResponse = json_decode($response, true);
if (!$loginResponse['success']) {
    echo "❌ Login falhou\n";
    echo $response . "\n";
    exit(1);
}

$token = $loginResponse['data']['token'];
echo "✅ Login realizado com sucesso\n\n";

// Headers para requisições autenticadas
$authHeaders = [
    'Authorization: Bearer ' . $token,
    'Accept: application/json',
    'Content-Type: application/json'
];

// 2. Testar cadastro de criança SEM campo idade
echo "2. Testando cadastro de criança sem campo idade...\n";

$criancaData = [
    'nome' => 'João Teste da Silva',
    'data_nascimento' => '2020-03-15', // Criança de ~4 anos
    'cpf' => '12345678901', // CPF fictício para teste
    'responsavel_id' => 1, // Primeiro responsável
    'preferencias_creche' => [
        [
            'creche_id' => 1,
            'ordem_preferencia' => 1
        ],
        [
            'creche_id' => 2,
            'ordem_preferencia' => 2
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/criancas');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($criancaData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $authHeaders);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 201) {
    echo "✅ Criança cadastrada com sucesso!\n";
    $data = json_decode($response, true);
    echo "   Nome: " . $data['data']['nome'] . "\n";
    echo "   Data Nascimento: " . $data['data']['data_nascimento'] . "\n";
    echo "   Idade Calculada: " . $data['data']['idade'] . " anos\n";
    echo "   Responsável: " . $data['data']['responsavel']['nome'] . "\n";
    echo "   Preferências: " . count($data['data']['preferencias_creche']) . " creches\n";
} else {
    echo "❌ Erro no cadastro: HTTP $httpCode\n";
    echo $response . "\n";
    
    $errorData = json_decode($response, true);
    if (isset($errorData['errors'])) {
        echo "\nErros de validação:\n";
        foreach ($errorData['errors'] as $field => $messages) {
            echo "   $field: " . implode(', ', $messages) . "\n";
        }
    }
}

echo "\n🎉 Teste concluído!\n";
