# Scripts SQL para Módulo de Supervisão Ocupacional

## Ordem de Execução

Execute os scripts na seguinte ordem:

### 1. Criar Schemas e Tabelas
```bash
psql -U postgres -d pinovara -f docs/familias.sql
```
Este script cria:
- Schemas `familias` e `familias_aux`
- Todas as tabelas necessárias
- Permissões para o usuário `pinovara`

### 2. Criar Módulo e Roles
```bash
psql -U postgres -d pinovara -f scripts/database/create-module-supervisao-ocupacional.sql
```
Este script cria:
- Módulo `supervisao_ocupacional` na tabela `pinovara.modules`
- Roles: `admin`, `coordenador`, `tecnico`, `estagiario`

### 3. Inserir Dados de Teste (Opcional)
```bash
psql -U postgres -d pinovara -f scripts/database/insert-test-data-supervisao-ocupacional.sql
```
Este script insere:
- Estados e municípios básicos
- 5 glebas/assentamentos de teste
- 5 famílias de teste com diferentes status de validação

## Atribuir Permissões a Usuário

Para dar acesso ao módulo a um usuário específico:

```sql
-- Obter IDs do módulo e role
SELECT m.id as module_id, r.id as role_id, r.name as role_name
FROM pinovara.modules m
JOIN pinovara.roles r ON r."moduleId" = m.id
WHERE m.name = 'supervisao_ocupacional';

-- Atribuir role ao usuário (substitua USER_ID e ROLE_ID)
INSERT INTO pinovara.user_roles ("userId", "roleId", "createdAt", "updatedAt")
VALUES (USER_ID, ROLE_ID, NOW(), NOW())
ON CONFLICT ("userId", "roleId") DO NOTHING;
```

## Verificar Instalação

```sql
-- Verificar módulo criado
SELECT * FROM pinovara.modules WHERE name = 'supervisao_ocupacional';

-- Verificar roles criadas
SELECT r.* FROM pinovara.roles r
JOIN pinovara.modules m ON r."moduleId" = m.id
WHERE m.name = 'supervisao_ocupacional';

-- Verificar dados de teste
SELECT COUNT(*) as total_glebas FROM familias_aux.gleba;
SELECT COUNT(*) as total_familias FROM familias.familias_individual WHERE removido = false;
```
