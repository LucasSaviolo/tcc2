// Teste de API - Cole isso no console do navegador para debug

// 1. Verificar se tem token
console.log('Token atual:', localStorage.getItem('auth_token'));

// 2. Fazer login manual se não tiver token
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@teste.com',
    password: 'password'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login Response:', data);
  if (data.success && data.data.token) {
    localStorage.setItem('auth_token', data.data.token);
    console.log('Token salvo:', data.data.token);
  }
})
.catch(error => console.error('Login Error:', error));

// 3. Testar busca de creches com token
setTimeout(() => {
  const token = localStorage.getItem('auth_token');
  fetch('/api/creches', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => console.log('Creches Response:', data))
  .catch(error => console.error('Creches Error:', error));
}, 1000);

// 4. Testar busca de crianças com token
setTimeout(() => {
  const token = localStorage.getItem('auth_token');
  fetch('/api/criancas', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => console.log('Crianças Response:', data))
  .catch(error => console.error('Crianças Error:', error));
}, 2000);
