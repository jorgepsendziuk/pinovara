"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '../../../.env.test') });
const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const ORG_ID = parseInt(process.env.TEST_ORG_ID || '14', 10);
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'jimxxx@gmail.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;
if (!TEST_PASSWORD) {
    console.error('❌ ERRO: Variável TEST_USER_PASSWORD não definida!');
    console.error('   Crie um arquivo .env.test baseado em .env.test.example');
    process.exit(1);
}
async function testarAPIEdicao() {
    console.log('🧪 TESTANDO API DE EDIÇÃO - Organização ID', ORG_ID);
    console.log('');
    try {
        console.log('1️⃣ Fazendo login...');
        const loginResponse = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        const token = loginResponse.data.data.token;
        console.log('✅ Login realizado com sucesso');
        console.log('👤 Usuário:', loginResponse.data.data.user.name);
        console.log('');
        console.log('2️⃣ Buscando organização atual...');
        const getResponse = await axios_1.default.get(`${API_URL}/organizacoes/${ORG_ID}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const orgAtual = getResponse.data.data;
        console.log('✅ Organização encontrada:', orgAtual.nome);
        console.log('📊 Campos atuais:');
        console.log('   - CNPJ:', orgAtual.cnpj);
        console.log('   - Telefone:', orgAtual.telefone);
        console.log('   - Email:', orgAtual.email);
        console.log('   - Total Sócios:', orgAtual.caracteristicas_n_total_socios);
        console.log('   - Descrição:', orgAtual.descricao ? orgAtual.descricao.substring(0, 50) + '...' : 'null');
        console.log('   - Validação Status:', orgAtual.validacao_status);
        console.log('');
        console.log('3️⃣ Preparando dados de atualização...');
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const dadosAtualizacao = {
            ...orgAtual,
            nome: `TESTE API ${timestamp}`,
            telefone: '21987654321',
            email: 'api.teste@pinovara.org',
            organizacao_end_logradouro: 'Rua API Teste',
            representante_nome: 'Maria API Teste',
            caracteristicas_n_total_socios: 200,
            descricao: `Teste de API em ${timestamp}`,
            obs: `Observacoes API ${timestamp}`,
            metodologia: 'Metodologia via API',
            go_organizacao_7_resposta: 3,
            go_organizacao_7_comentario: 'Comentario via API',
            gf_contas_5_resposta: 4,
            last_update_date: new Date()
        };
        console.log('✅ Dados preparados (modificando 10+ campos)');
        console.log('');
        console.log('4️⃣ Enviando atualização via API...');
        const updateResponse = await axios_1.default.put(`${API_URL}/organizacoes/${ORG_ID}`, dadosAtualizacao, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (updateResponse.data.success) {
            console.log('✅ API retornou sucesso!');
            console.log('📨 Mensagem:', updateResponse.data.message);
        }
        else {
            console.log('❌ API retornou erro:', updateResponse.data.error);
            return;
        }
        console.log('');
        console.log('5️⃣ Verificando se salvou no banco...');
        const verificacaoResponse = await axios_1.default.get(`${API_URL}/organizacoes/${ORG_ID}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const orgDepois = verificacaoResponse.data.data;
        const camposVerificar = [
            { nome: 'Nome', esperado: dadosAtualizacao.nome, atual: orgDepois.nome },
            { nome: 'Telefone', esperado: dadosAtualizacao.telefone, atual: orgDepois.telefone },
            { nome: 'Email', esperado: dadosAtualizacao.email, atual: orgDepois.email },
            { nome: 'Endereço', esperado: dadosAtualizacao.organizacao_end_logradouro, atual: orgDepois.organizacao_end_logradouro },
            { nome: 'Representante', esperado: dadosAtualizacao.representante_nome, atual: orgDepois.representante_nome },
            { nome: 'Total Sócios', esperado: dadosAtualizacao.caracteristicas_n_total_socios, atual: orgDepois.caracteristicas_n_total_socios },
            { nome: 'Descrição', esperado: dadosAtualizacao.descricao, atual: orgDepois.descricao },
            { nome: 'Observações', esperado: dadosAtualizacao.obs, atual: orgDepois.obs },
            { nome: 'Metodologia', esperado: dadosAtualizacao.metodologia, atual: orgDepois.metodologia },
            { nome: 'GO 7 Resposta', esperado: dadosAtualizacao.go_organizacao_7_resposta, atual: orgDepois.go_organizacao_7_resposta },
            { nome: 'GO 7 Comentário', esperado: dadosAtualizacao.go_organizacao_7_comentario, atual: orgDepois.go_organizacao_7_comentario },
            { nome: 'GF 5 Resposta', esperado: dadosAtualizacao.gf_contas_5_resposta, atual: orgDepois.gf_contas_5_resposta },
        ];
        let sucessos = 0;
        let erros = 0;
        console.log('\n📋 Verificação campo a campo:');
        for (const campo of camposVerificar) {
            if (campo.esperado === campo.atual) {
                console.log(`   ✅ ${campo.nome}: OK`);
                sucessos++;
            }
            else {
                console.log(`   ❌ ${campo.nome}: ERRO`);
                console.log(`      Esperado: ${campo.esperado}`);
                console.log(`      Salvo: ${campo.atual}`);
                erros++;
            }
        }
        console.log('');
        console.log('📊 RESUMO DO TESTE VIA API:');
        console.log(`   ✅ Campos corretos: ${sucessos}`);
        console.log(`   ❌ Campos com erro: ${erros}`);
        console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + erros)) * 100).toFixed(1)}%`);
        console.log('');
        if (erros === 0) {
            console.log('🎉 TESTE VIA API CONCLUÍDO COM SUCESSO!');
            console.log('   Todos os campos foram salvos corretamente via PUT /organizacoes/14');
        }
        else {
            console.log('⚠️  ATENÇÃO: Alguns campos não foram salvos via API.');
        }
    }
    catch (error) {
        console.error('');
        console.error('💥 ERRO NO TESTE:', error.response?.data || error.message);
        console.error('');
        if (error.response) {
            console.error('📝 Detalhes da resposta:');
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}
testarAPIEdicao()
    .then(() => {
    console.log('\n✅ Script de teste API finalizado.');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
});
//# sourceMappingURL=testar-api-edicao.js.map