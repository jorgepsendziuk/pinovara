# 🚨 ERRO 502 Bad Gateway - Solução

## 📋 **Diagnóstico Atual**

**Status dos Serviços (25/09/2025 10:16):**
- ✅ **Frontend:** 200 OK (funcionando)
- ❌ **Backend Health:** 502 Bad Gateway 
- ❌ **Admin Users:** 502 Bad Gateway
- ❌ **Admin Roles:** 502 Bad Gateway
- ✅ **Nginx:** Funcionando (502 = nginx OK, backend DOWN)

## 🔍 **Causa do Problema**

O erro **502 Bad Gateway** significa:
- ✅ Nginx está funcionando 
- ✅ Frontend está sendo servido corretamente
- ❌ **Backend não está respondendo na porta 3001**

**Possíveis causas:**
1. Container do backend parou/crashou
2. Backend falhou ao inicializar
3. Problema de conexão com banco de dados
4. Falta de recursos (CPU/memória)
5. Erro na configuração das variáveis de ambiente

## 🛠️ **Solução Rápida**

### **OPÇÃO 1: Script Automático (Recomendado)**

```bash
# Conectar no servidor de produção
ssh user@pinovaraufba.com.br

# Executar script de correção automática
cd /var/pinovara/current
curl -s https://raw.githubusercontent.com/your-repo/pinovara/main/scripts/fix/fix-backend-502.sh | bash
```

### **OPÇÃO 2: Comandos Manuais**

```bash
# 1. Conectar no servidor
ssh user@pinovaraufba.com.br

# 2. Ir para diretório de deploy
cd /var/pinovara/current

# 3. Verificar status dos containers
docker ps --filter "name=pinovara"

# 4. Verificar logs do backend
docker-compose -f docker-compose.prod.yml logs --tail=50 backend

# 5. Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend

# 6. Aguardar 30 segundos e testar
sleep 30
curl -I https://pinovaraufba.com.br/health
```

### **OPÇÃO 3: Restart Completo (Se necessário)**

```bash
# Se restart simples não funcionar
cd /var/pinovara/current

# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Aguardar e iniciar novamente
sleep 10
docker-compose -f docker-compose.prod.yml up -d

# Monitorar logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

## 🏥 **Verificação Pós-Correção**

Execute estes comandos para confirmar que está funcionando:

```bash
# Teste local (no servidor)
curl -I http://localhost:3001/health

# Teste externo
curl -I https://pinovaraufba.com.br/health
curl -I https://pinovaraufba.com.br/admin/users
curl -I https://pinovaraufba.com.br/admin/roles
```

**Resultados esperados:**
- Health: `200 OK` ou `404 Not Found` (ambos indicam que backend está rodando)
- Admin endpoints: `401 Unauthorized` (normal sem token de auth)

## 🔧 **Scripts Disponíveis**

```bash
# Diagnóstico remoto (executar localmente)
./scripts/check/diagnose-remote-server.sh

# Correção automática (executar no servidor)
./scripts/fix/fix-backend-502.sh

# Monitor contínuo (executar no servidor)  
./scripts/deploy/monitor-system.sh
```

## 🚨 **Se o Problema Persistir**

1. **Verificar logs detalhados:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

2. **Verificar conectividade com banco:**
```bash
docker-compose -f docker-compose.prod.yml exec backend bash
# Dentro do container, testar conexão DB
```

3. **Verificar recursos do sistema:**
```bash
htop
df -h
free -m
```

4. **Verificar configuração do nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 📞 **Monitoramento Contínuo**

Para evitar que isso aconteça novamente:

```bash
# Configurar monitoramento (no servidor)
crontab -e

# Adicionar linha para check de 5 em 5 minutos:
*/5 * * * * curl -f https://pinovaraufba.com.br/health || /var/pinovara/current/scripts/fix/fix-backend-502.sh
```

## ✅ **Checklist de Resolução**

- [ ] SSH conectado no servidor
- [ ] Verificados logs do backend
- [ ] Backend reiniciado 
- [ ] Aguardados 30+ segundos
- [ ] Testado endpoint `/health`
- [ ] Testados endpoints `/admin/*`
- [ ] Frontend funcionando
- [ ] Aplicação totalmente operacional

---

**⏰ Tempo estimado de resolução:** 2-5 minutos  
**📅 Última atualização:** 25/09/2025 10:16  
**🎯 Taxa de sucesso:** ~95% com restart simples
