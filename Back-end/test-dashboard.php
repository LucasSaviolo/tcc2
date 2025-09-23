<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔍 Testando Rotas do Dashboard\n";
echo "================================\n\n";

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
    'Accept: application/json'
];

// 2. Testar /api/dashboard/stats
echo "2. Testando /api/dashboard/stats...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/dashboard/stats');
curl_setopt($ch, CURLOPT_HTTPHEADER, $authHeaders);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ Stats: OK\n";
    $data = json_decode($response, true);
    echo "   Dados: " . json_encode($data['data'], JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "❌ Stats: ERRO HTTP $httpCode\n";
    echo $response . "\n\n";
}

// 3. Testar /api/dashboard/chart
echo "3. Testando /api/dashboard/chart...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/dashboard/chart');
curl_setopt($ch, CURLOPT_HTTPHEADER, $authHeaders);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ Chart: OK\n";
    $data = json_decode($response, true);
    echo "   Labels: " . implode(', ', $data['data']['labels']) . "\n";
    echo "   Dados: " . implode(', ', $data['data']['datasets'][0]['data']) . "\n\n";
} else {
    echo "❌ Chart: ERRO HTTP $httpCode\n";
    echo $response . "\n\n";
}

// 4. Testar /api/dashboard/recent
echo "4. Testando /api/dashboard/recent...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/dashboard/recent');
curl_setopt($ch, CURLOPT_HTTPHEADER, $authHeaders);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ Recent: OK\n";
    $data = json_decode($response, true);
    echo "   Atividades encontradas: " . count($data['data']) . "\n";
    foreach ($data['data'] as $activity) {
        echo "   - " . $activity['description'] . " (" . $activity['type'] . ")\n";
    }
} else {
    echo "❌ Recent: ERRO HTTP $httpCode\n";
    echo $response . "\n";
}

echo "\n🎉 Teste concluído!\n";
