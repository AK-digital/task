#!/bin/bash

# Script de test simple pour la limitation IA
# Ce script teste les routes avec un token factice pour démontrer le fonctionnement

API_BASE="http://localhost:5001/api"
FAKE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzM0NTY3ODkwYWJjZGVmMTIzNDU2NzgiLCJpYXQiOjE2OTQxMjM0NTYsImV4cCI6MTY5NDEyNzA1Nn0.test"

echo "🧪 Test de la limitation IA"
echo "=================================="
echo ""

echo "📊 1. Test de la route d'usage (sans token - devrait échouer):"
curl -s -X GET "$API_BASE/ai/usage" | jq '.' 2>/dev/null || echo "Pas de jq installé, réponse brute:"
curl -s -X GET "$API_BASE/ai/usage"
echo ""
echo ""

echo "📊 2. Test de la route d'usage (avec token factice - devrait échouer avec une erreur différente):"
curl -s -X GET "$API_BASE/ai/usage" \
  -H "Authorization: Bearer $FAKE_TOKEN" | head -c 200
echo ""
echo ""

echo "🎯 3. Test de la route de test (sans token - devrait échouer):"
curl -s -X POST "$API_BASE/ai/test-limit" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' | head -c 200
echo ""
echo ""

echo "🎯 4. Test de la route de test (avec token factice - devrait échouer avec une erreur différente):"
curl -s -X POST "$API_BASE/ai/test-limit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FAKE_TOKEN" \
  -d '{"prompt": "test"}' | head -c 200
echo ""
echo ""

echo "🔄 5. Test de la route de reset (avec token factice):"
curl -s -X DELETE "$API_BASE/ai/reset-usage" \
  -H "Authorization: Bearer $FAKE_TOKEN" | head -c 200
echo ""
echo ""

echo "✅ Tests terminés!"
echo ""
echo "📝 Résultats attendus:"
echo "   - Sans token: 'Accès refusé : Aucun token reçu'"
echo "   - Avec token factice: Erreur de validation du token"
echo "   - Les routes sont bien protégées par l'authentification"
echo ""
echo "💡 Pour tester complètement, il faut:"
echo "   1. Créer un compte utilisateur"
echo "   2. Se connecter pour obtenir un vrai token JWT"
echo "   3. Utiliser ce token pour tester les fonctionnalités"
