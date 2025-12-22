# Scripts de Configuração de Diretórios de Upload

## 📁 Diretórios Configurados

### Local (Desenvolvimento)
- **Materiais**: `/Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao/materiais`
- **Evidências**: `/Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao/evidencias`

### Remoto (Produção)
- **Materiais**: `/var/pinovara/shared/uploads/capacitacao/materiais`
- **Evidências**: `/var/pinovara/shared/uploads/capacitacao/evidencias`

## 🚀 Como Usar

### Local (Desenvolvimento)
```bash
bash scripts/setup-upload-directories-local.sh
```

### Remoto (Produção)
```bash
# No servidor, execute:
bash scripts/setup-upload-directories-remote.sh

# O script já ajusta automaticamente o ownership para jimxxx:jimxxx
# (conforme verificado no diretório /var/pinovara/shared/uploads/repositorio)
```

### Automático (Detecta ambiente)
```bash
bash scripts/setup-upload-directories.sh
```

## 📋 Comandos Manuais

### Local
```bash
mkdir -p /Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao/materiais
mkdir -p /Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao/evidencias
chmod -R 755 /Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao
```

### Remoto
```bash
sudo mkdir -p /var/pinovara/shared/uploads/capacitacao/materiais
sudo mkdir -p /var/pinovara/shared/uploads/capacitacao/evidencias
sudo chmod -R 755 /var/pinovara/shared/uploads/capacitacao
sudo chown -R jimxxx:jimxxx /var/pinovara/shared/uploads/capacitacao
```

## ⚠️ Notas
- **Usuário padrão do servidor**: `jimxxx:jimxxx` (verificado em `/var/pinovara/shared/uploads/repositorio`)
- As permissões 755 permitem leitura e execução para todos, escrita apenas para o dono
- Para usar outro usuário/grupo, defina as variáveis de ambiente antes de executar:
  ```bash
  export UPLOAD_USER=outro_usuario
  export UPLOAD_GROUP=outro_grupo
  bash scripts/setup-upload-directories-remote.sh
  ```
