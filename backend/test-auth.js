const { AuthService, validateLoginData } = require('./dist/services/authService.js');

async function testAuth() {
  try {
    console.log('🔍 Testando validação...');
    const loginData = validateLoginData({
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Validação passou:', loginData);

    console.log('🔍 Testando login...');
    const result = await AuthService.login(loginData);
    console.log('✅ Login funcionou:', result);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuth();
