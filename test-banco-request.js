const fetch = require('node-fetch');
require('dotenv').config();

// URL da API
const API_URL = 'http://localhost:3000/api/financas/bancos/11';

// Token do usuário (substitua pelo token real do seu usuário)
const token = process.env.TEST_TOKEN || 'seu_token_aqui';

async function testBancoRequest() {
  try {
    console.log('Testando rota:', API_URL);
    
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    
    try {
      const data = await response.json();
      console.log('Resposta:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Não foi possível ler o corpo da resposta como JSON');
    }
    
    if (!response.ok) {
      console.error('Erro na requisição:', response.statusText);
    }
    
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
  }
}

testBancoRequest();
