#!/bin/bash

# ==========================================
# 🧪 PINOVARA - Testar Conexão com Banco
# ==========================================
# Testa conexão com PostgreSQL manualmente

echo "🧪 Testing database connection..."

# Install PostgreSQL client if needed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL client..."
    sudo apt update && sudo apt install -y postgresql-client
fi

# Database connection parameters
DB_HOST="10.158.0.2"
DB_PORT="5432"
DB_NAME="pinovara"
DB_USER="pinovara"

echo "🔗 Connection details:"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test 1: Network connectivity
echo ""
echo "🌐 Test 1: Network connectivity"
ping -c 2 $DB_HOST

# Test 2: Port connectivity
echo ""
echo "🚪 Test 2: Port connectivity"
nc -zv $DB_HOST $DB_PORT

# Test 3: Database connection
echo ""
echo "🗄️  Test 3: Database connection"
PGPASSWORD="" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check if database server is running"
    echo "2. Verify firewall settings"
    echo "3. Check database user permissions"
    echo "4. Verify database name and host"
fi

# Test 4: Backend environment
echo ""
echo "⚙️  Test 4: Backend environment"
if [ -f "/var/www/pinovara/backend/.env" ]; then
    echo "✅ Backend .env file exists"
    cat /var/www/pinovara/backend/.env
else
    echo "❌ Backend .env file missing"
    echo "Creating default .env file..."
    cat > /var/www/pinovara/backend/.env << 'EOF'
NODE_ENV=production
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="https://pinovaraufba.com.br"
EOF
    echo "✅ Created .env file with default configuration"
fi
