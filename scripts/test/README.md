# 🧪 Scripts de Teste

Scripts para testar e verificar o funcionamento do PINOVARA.

## 📁 Arquivos

- **`test-db-connection.sh`** - Teste de conexão com banco
- **`check-deployment.sh`** - Verificação de deploy

## 🎯 Scripts Disponíveis

### `test-db-connection.sh`
Testa a conexão com o banco de dados:
- Conectividade PostgreSQL
- Credenciais válidas
- Schema correto

**Uso:**
```bash
./scripts/test/test-db-connection.sh
```

### `check-deployment.sh`
Verifica se o deploy foi bem-sucedido:
- Status dos serviços
- Conectividade dos endpoints
- Logs de erro

**Uso:**
```bash
./scripts/test/check-deployment.sh
```

## 🔍 Testes Disponíveis

### Conectividade
```bash
curl https://pinovaraufba.com.br/health
curl https://pinovaraufba.com.br/
```

### Banco de Dados
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### Serviços
```bash
pm2 status
sudo systemctl status nginx
```

## 📊 Verificações

- ✅ Frontend carregando
- ✅ Backend respondendo
- ✅ Banco conectado
- ✅ Nginx funcionando
- ✅ PM2 rodando