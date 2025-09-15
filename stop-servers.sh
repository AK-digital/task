#!/bin/bash

echo "🛑 Arrêt des serveurs Clynt..."

# Couleurs
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Arrêt du serveur Next.js...${NC}"
pkill -f "next dev" 2>/dev/null || true

echo -e "${YELLOW}Arrêt du serveur API (nodemon)...${NC}"
pkill -f "nodemon" 2>/dev/null || true

echo -e "${YELLOW}Arrêt des processus Node.js sur les ports 3000 et 5001...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

sleep 2
echo -e "${RED}✅ Tous les serveurs ont été arrêtés${NC}"
