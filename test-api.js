// Script para probar la conexión con la API
const axios = require('axios');

const API_URL = 'http://localhost:8000/api/v1';

async function testAPI() {
  console.log('Probando conexión con:', API_URL);
  
  try {
    // Test 1: Verificar que el servidor responde
    console.log('\n1. Probando endpoint base...');
    const healthCheck = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✓ Servidor respondiendo:', healthCheck.status);
  } catch (error) {
    console.log('✗ Error en health check:', error.message);
  }

  try {
    // Test 2: Probar login con credenciales de prueba
    console.log('\n2. Probando login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'password123'
    }, { timeout: 5000 });
    console.log('✓ Login exitoso:', loginResponse.status);
  } catch (error) {
    if (error.response) {
      console.log('✗ Error en login:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('✗ No se recibió respuesta del servidor');
      console.log('  Posibles causas:');
      console.log('  - El backend no está corriendo');
      console.log('  - El túnel de Cloudflare está caído');
      console.log('  - Problemas de red/firewall');
    } else {
      console.log('✗ Error:', error.message);
    }
  }
}

testAPI();
