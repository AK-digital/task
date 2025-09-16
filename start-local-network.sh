#!/bin/bash

echo "🚀 Démarrage des serveurs Clynt pour le réseau local..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tuer les processus existants
cleanup() {
    echo -e "${YELLOW}🛑 Arrêt des serveurs existants...${NC}"
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    sleep 2
}

# Nettoyage initial
cleanup

echo -e "${BLUE}📡 Configuration réseau local:${NC}"
echo -e "  • Frontend: http://clynt.local:3000 (http://192.168.1.21:3000)"
echo -e "  • API:      http://api.clynt.local:5001 (http://192.168.1.21:5001)"
echo -e "  • Réseau:   Accessible depuis tout le réseau 192.168.1.x"
echo ""

# Démarrage de l'API
echo -e "${GREEN}🔧 Démarrage de l'API...${NC}"
cd api
npm run dev &
API_PID=$!
echo "API PID: $API_PID"

# Attendre que l'API soit prête
sleep 3

# Démarrage du client
echo -e "${GREEN}🌐 Démarrage du client Next.js...${NC}"
cd ../client
HOSTNAME=0.0.0.0 PORT=3000 FAST_REFRESH=false npm run dev &
CLIENT_PID=$!
echo "Client PID: $CLIENT_PID"

echo ""
echo -e "${GREEN}✅ Serveurs démarrés!${NC}"
echo -e "${BLUE}📱 Accès depuis le réseau:${NC}"
echo -e "  • Application: http://192.168.1.21:3000"
echo -e "  • API:         http://192.168.1.21:5001"
echo ""
echo -e "${YELLOW}💡 Pour arrêter les serveurs: Ctrl+C ou ./stop-servers.sh${NC}"

# Attendre les processus
wait $API_PID $CLIENT_PID
