#!/bin/bash

echo "🔑 SSH Key Configuration Helper"
echo "================================"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "❌ No SSH private key found at ~/.ssh/id_rsa"
    echo ""
    echo "To generate a new SSH key pair, run:"
    echo "ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
    echo ""
    echo "Or specify a different key file:"
    echo "cat /path/to/your/private/key"
    exit 1
fi

echo "✅ Found SSH private key at ~/.ssh/id_rsa"
echo ""
echo "📋 Copy this entire content and add it as SSH_PRIVATE_KEY secret:"
echo "=================================================================="
echo ""

cat ~/.ssh/id_rsa

echo ""
echo "=================================================================="
echo ""
echo "📝 Instructions:"
echo "1. Copy the content above (from -----BEGIN to -----END)"
echo "2. Go to GitHub → Repository → Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Name: SSH_PRIVATE_KEY"
echo "5. Value: [paste the content above]"
echo "6. Click 'Add secret'"
echo ""
echo "Also configure:"
echo "• SERVER_HOST: pinovaraufba.com.br"
echo "• SERVER_USER: ubuntu (or your server username)"
