# 🔍 Scripts de Verificação

Scripts para verificar o status e saúde do sistema PINOVARA.

## 📁 Arquivos

- **`check-database.sh`** - Verificação banco de dados
- **`diagnose-db.sh`** - Diagnóstico banco
- **`nginx-monitor.sh`** - Monitor nginx

## 🎯 Scripts Disponíveis

### `check-database.sh`
Verifica a saúde do banco de dados:
- Conectividade PostgreSQL
- Tabelas existentes
- Dados básicos
- Performance

**Uso:**
```bash
./scripts/check/check-database.sh
```

### `diagnose-db.sh`
Diagnóstico completo do banco:
- Análise de performance
- Verificação de índices
- Espaço em disco
- Conexões ativas

**Uso:**
```bash
./scripts/check/diagnose-db.sh
```

### `nginx-monitor.sh`
Monitora o nginx:
- Status do serviço
- Logs de erro
- Configuração válida
- Performance

**Uso:**
```bash
./scripts/check/nginx-monitor.sh
```

## 📊 Verificações Disponíveis

### Banco de Dados
- ✅ Conectividade
- ✅ Tabelas existentes
- ✅ Usuários cadastrados
- ✅ Performance

### Nginx
- ✅ Status do serviço
- ✅ Configuração válida
- ✅ Logs de erro
- ✅ Certificados SSL

### Sistema
- ✅ Espaço em disco
- ✅ Memória disponível
- ✅ CPU usage
- ✅ Serviços rodando

## 🔍 Comandos Úteis

```bash
# Status geral
pm2 status
sudo systemctl status nginx

# Logs
pm2 logs pinovara-backend
sudo tail -f /var/log/nginx/pinovaraufba_error.log

# Performance
htop
df -h
free -h
```