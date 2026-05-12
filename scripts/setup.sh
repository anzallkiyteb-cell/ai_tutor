#!/bin/bash
# Run this script once to set up the project

set -e

echo "=== AI Tutor Setup ==="

# 1. Use Node 22
export PATH="$HOME/.nvm/versions/node/v22.17.0/bin:$PATH"
echo "Node: $(node --version)"

# 2. Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# 3. Database setup
echo ""
echo "Setting up database..."
echo "Run this command to create the database (you need the postgres password):"
echo "  sudo -u postgres psql -f scripts/setup-db.sql"
echo ""
echo "Or if you know the postgres password:"
echo "  psql -U postgres -f scripts/setup-db.sql"
echo ""
read -p "Press Enter after you've created the database, or Ctrl+C to skip..."

# 4. Update .env with correct DB URL
if grep -q "YOUR_KEY_HERE" .env; then
  echo ""
  echo "=== IMPORTANT: Configure your .env file ==="
  echo ""
  echo "1. NVIDIA NIM API Key (FREE, no credit card):"
  echo "   → Go to https://build.nvidia.com/"
  echo "   → Sign in / Create account"
  echo "   → Click any model → 'Get API Key'"
  echo "   → Copy the key (starts with nvapi-)"
  echo ""
  echo "2. Edit .env and replace nvapi-YOUR_KEY_HERE with your key"
  echo "   Also update DATABASE_URL if needed"
  echo ""
  echo "Default DATABASE_URL: postgresql://ai_tutor_user:ai_tutor_pass@localhost:5432/ai_tutor"
fi

# 5. Generate Prisma client
echo ""
echo "Generating Prisma client..."
DATABASE_URL="${DATABASE_URL:-postgresql://ai_tutor_user:ai_tutor_pass@localhost:5432/ai_tutor}" npx prisma generate

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start the development server:"
echo "  export PATH=\"\$HOME/.nvm/versions/node/v22.17.0/bin:\$PATH\""
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
