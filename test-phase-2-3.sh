#!/bin/bash

echo "🔍 Testing Phase 2-3: Project Setup & Database"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "server/.env" ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
  cp server/.env.example server/.env
  echo -e "${RED}❌ Please edit server/.env with your database credentials${NC}"
  exit 1
fi

echo "✅ .env file exists"
echo ""

# Test database connection
echo "📊 Testing database connection..."
cd server
node -e "
const { sequelize, testConnection } = require('./src/config/database');
testConnection().then(() => {
  console.log('✅ Database connection successful');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"

if [ $? -eq 0 ]; then
  echo ""
  echo "🔄 Running migrations..."
  npx sequelize-cli db:migrate

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Phase 2-3 Test PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start server: cd server && npm run dev"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Start admin: cd admin && npm run dev"
  else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ Database connection failed${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Make sure PostgreSQL is running"
  echo "2. Check database credentials in server/.env"
  echo "3. Create database: createdb thichcuu_fb_tool"
  exit 1
fi
