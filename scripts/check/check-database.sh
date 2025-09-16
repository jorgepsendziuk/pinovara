#!/bin/bash

# ==========================================
# 🔍 PINOVARA - Verificar Banco de Dados
# ==========================================
# Diagnóstica problemas de conexão com PostgreSQL

echo "🔍 Checking database connection..."

# Check if PostgreSQL client is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Installing..."
    sudo apt update && sudo apt install -y postgresql-client
fi

# Database connection details
DB_HOST="10.158.0.2"
DB_PORT="5432"
DB_NAME="pinovara"
DB_USER="pinovara"

echo "📊 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test basic connectivity
echo ""
echo "🔌 Testing network connectivity..."
if ping -c 3 $DB_HOST &> /dev/null; then
    echo "✅ Network: Can reach $DB_HOST"
else
    echo "❌ Network: Cannot reach $DB_HOST"
    echo "   Check firewall rules and network configuration"
fi

# Test PostgreSQL port
echo ""
echo "🚪 Testing PostgreSQL port..."
if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "✅ Port $DB_PORT: Open on $DB_HOST"
else
    echo "❌ Port $DB_PORT: Closed or filtered on $DB_HOST"
    echo "   Check if PostgreSQL is running on the database server"
fi

# Test database connection
echo ""
echo "🗄️  Testing database connection..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Database: Connection successful"
else
    echo "❌ Database: Connection failed"
    echo "   Possible causes:"
    echo "   - Wrong credentials"
    echo "   - Database not running"
    echo "   - Firewall blocking connection"
    echo "   - Wrong database name"
fi

# Check backend configuration
echo ""
echo "⚙️  Checking backend configuration..."
if [ -f "/var/www/pinovara/backend/.env" ]; then
    echo "✅ Backend config file exists"
    grep "DATABASE_URL" /var/www/pinovara/backend/.env
else
    echo "❌ Backend config file missing: /var/www/pinovara/backend/.env"
fi

# Check PM2 status
echo ""
echo "🔧 Checking PM2 status..."
if command -v pm2 &> /dev/null; then
    pm2 list | grep pinovara-backend || echo "⚠️  Backend process not found in PM2"
else
    echo "❌ PM2 not installed"
fi

# Test backend health
echo ""
echo "❤️ Testing backend health..."
curl -s https://pinovaraufba.com.br/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/health

echo ""
echo "📋 Troubleshooting steps:"
echo "1. Verify database server is running: systemctl status postgresql"
echo "2. Check database credentials in backend/.env"
echo "3. Verify firewall allows connections from this server"
echo "4. Test connection from database server: psql -h localhost -U pinovara -d pinovara"
