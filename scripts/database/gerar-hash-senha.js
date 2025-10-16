const bcrypt = require('bcryptjs');

const senha = 'sabrina.diniz@incra.gov.br';
const hash = bcrypt.hashSync(senha, 10);

console.log('Senha:', senha);
console.log('Hash:', hash);

