# 📋 Instruções para Implementar Sistema de Upload de Documentos

## ✅ Status da Implementação

- ✅ Backend implementado (rotas, controller, service)
- ✅ Frontend implementado (componente de upload)
- ✅ Tabela `organizacao_documento` criada no banco
- ✅ Prisma schema atualizado
- ⚠️ **PENDENTE:** Dar permissões no banco de dados
- ⚠️ **PENDENTE:** Criar pastas no servidor remoto

---

## 🔧 Comandos para Executar no Servidor Remoto

### 1. Conectar no servidor
```bash
ssh user@bd.pinovaraufba.com.br
```

### 2. Dar permissões no banco de dados
```sql
-- Conectar no banco
psql -h localhost -U pinovara -d pinovara

-- Executar os comandos SQL:
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pinovara.organizacao_documento TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.organizacao_documento_id_seq TO pinovara;

-- Verificar permissões (opcional)
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'pinovara' 
  AND table_name = 'organizacao_documento';

-- Sair do psql
\q
```

### 3. Criar estrutura de pastas para uploads
```bash
# No servidor de aplicação (onde roda o backend)
sudo mkdir -p /var/pinovara/shared/uploads/termos-adesao
sudo mkdir -p /var/pinovara/shared/uploads/relatorios
sudo mkdir -p /var/pinovara/shared/uploads/listas-presenca
sudo mkdir -p /var/pinovara/shared/uploads/fotos

# Dar permissões
sudo chown -R www-data:www-data /var/pinovara/shared/uploads
sudo chmod -R 755 /var/pinovara/shared/uploads

# Verificar estrutura criada
ls -la /var/pinovara/shared/uploads/
```

---

## 🧪 Testar Localmente (Localhost)

Após dar as permissões no banco, teste no localhost:

1. **Acesse:** http://localhost:5173
2. **Login:** jimxxx@gmail.com / [SENHA_REMOVIDA_DO_HISTORICO]
3. **Navegue:** Organizações > Lista > ✏️ Editar
4. **Abra:** Accordion "Arquivos e Documentos"
5. **Teste:**
   - Selecione tipo de documento
   - Escolha um arquivo
   - Clique em "Enviar Documento"
   - Veja aparecer na lista
   - Teste download e exclusão

---

## 📁 Estrutura de Pastas

### No Servidor:
```
/var/pinovara/shared/uploads/
├── termos-adesao/       # Termos de adesão assinados
├── relatorios/          # Relatórios de atividades
├── listas-presenca/     # Listas de presença
└── fotos/               # Registros fotográficos
```

### Tipos de Documento:
- `termo_adesao` → Termo de Adesão
- `relatorio` → Relatório da Atividade
- `lista_presenca` → Lista de Presença
- `foto` → Registro Fotográfico

---

## 🔗 Endpoints da API

```
POST   /organizacoes/:id/documentos              # Upload
GET    /organizacoes/:id/documentos              # Listar
GET    /organizacoes/:id/documentos/:docId/download  # Download
DELETE /organizacoes/:id/documentos/:docId       # Deletar
```

---

## 🚀 Deploy para Produção

Quando estiver tudo testado e funcionando:

1. **Commit e push:**
```bash
git add .
git commit -m "feat: Sistema de upload de documentos implementado"
git push origin main
```

2. **Deploy automático via GitHub Actions**
   - O workflow `deploy.yml` vai executar automaticamente

3. **No servidor, após deploy:**
```bash
# Verificar se as pastas existem
ls -la /var/pinovara/shared/uploads/

# Verificar permissões
ls -ld /var/pinovara/shared/uploads/*/

# Verificar backend
pm2 logs pinovara-backend

# Testar API
curl -X GET https://pinovaraufba.com.br/organizacoes/1/documentos \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ⚠️ Troubleshooting

### Erro de permissão no banco:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pinovara.organizacao_documento TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.organizacao_documento_id_seq TO pinovara;
```

### Pasta não existe:
```bash
sudo mkdir -p /var/pinovara/shared/uploads/termos-adesao
sudo chown -R www-data:www-data /var/pinovara/shared/uploads
```

### Erro ao salvar arquivo:
```bash
# Verificar permissões
ls -ld /var/pinovara/shared/uploads/termos-adesao/

# Corrigir se necessário
sudo chmod 755 /var/pinovara/shared/uploads/termos-adesao/
```

---

## ✅ Checklist

- [ ] Executar SQL para dar permissões
- [ ] Criar pastas no servidor remoto
- [ ] Testar upload local
- [ ] Testar listagem local
- [ ] Testar download local
- [ ] Testar exclusão local
- [ ] Fazer commit e push
- [ ] Verificar deploy automático
- [ ] Testar em produção

---

**Última atualização:** 06/10/2025


