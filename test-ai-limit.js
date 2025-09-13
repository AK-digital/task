#!/usr/bin/env node

// Script de test pour la limitation IA
// Usage: node test-ai-limit.js [JWT_TOKEN]

const API_BASE = 'http://localhost:5001/api';

// Token JWT à passer en paramètre ou à définir ici
const JWT_TOKEN = process.argv[2] || 'YOUR_JWT_TOKEN_HERE';

if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  console.log('❌ Veuillez fournir un token JWT valide:');
  console.log('   node test-ai-limit.js YOUR_JWT_TOKEN');
  console.log('   ou modifiez la variable JWT_TOKEN dans le script');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${JWT_TOKEN}`
};

// Fonction utilitaire pour faire des requêtes
async function makeRequest(method, endpoint, body = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Tests
async function runTests() {
  console.log('🧪 Test de la limitation IA - Début des tests\n');

  // 1. Vérifier l'état initial
  console.log('📊 1. Vérification de l\'état initial...');
  const initialUsage = await makeRequest('GET', '/ai/usage');
  if (initialUsage.status === 200) {
    console.log('✅ Usage initial:', initialUsage.data);
  } else {
    console.log('❌ Erreur lors de la vérification:', initialUsage);
    return;
  }

  // 2. Réinitialiser l'usage pour commencer proprement
  console.log('\n🔄 2. Réinitialisation de l\'usage...');
  const reset = await makeRequest('DELETE', '/ai/reset-usage');
  if (reset.status === 200) {
    console.log('✅ Usage réinitialisé:', reset.data);
  } else {
    console.log('❌ Erreur lors de la réinitialisation:', reset);
  }

  // 3. Tester quelques générations réussies
  console.log('\n🎯 3. Test de 3 générations réussies...');
  for (let i = 1; i <= 3; i++) {
    const result = await makeRequest('POST', '/ai/test-limit', {
      prompt: `Test de génération ${i}`,
      simulate: 'success'
    });
    
    if (result.status === 200) {
      console.log(`✅ Génération ${i} réussie:`, {
        title: result.data.title,
        test: result.data.test,
        message: result.data.message
      });
    } else {
      console.log(`❌ Erreur génération ${i}:`, result);
    }
  }

  // 4. Vérifier l'usage après 3 générations
  console.log('\n📊 4. Vérification de l\'usage après 3 générations...');
  const usageAfter3 = await makeRequest('GET', '/ai/usage');
  if (usageAfter3.status === 200) {
    console.log('✅ Usage après 3 générations:', usageAfter3.data);
  }

  // 5. Tester une erreur simulée (ne devrait pas compter dans la limite)
  console.log('\n💥 5. Test d\'une erreur simulée...');
  const errorTest = await makeRequest('POST', '/ai/test-limit', {
    prompt: 'Test erreur',
    simulate: 'error'
  });
  console.log('✅ Erreur simulée (attendue):', {
    status: errorTest.status,
    error: errorTest.data.error,
    test: errorTest.data.test
  });

  // 6. Générer 7 autres succès pour atteindre la limite
  console.log('\n🔥 6. Génération de 7 autres succès pour atteindre la limite...');
  for (let i = 4; i <= 10; i++) {
    const result = await makeRequest('POST', '/ai/test-limit', {
      prompt: `Test limite ${i}`,
      simulate: 'success'
    });
    
    if (result.status === 200) {
      console.log(`✅ Génération ${i}/10 réussie`);
    } else {
      console.log(`❌ Erreur génération ${i}:`, result);
    }
  }

  // 7. Vérifier l'usage à la limite
  console.log('\n📊 7. Vérification de l\'usage à la limite...');
  const usageAtLimit = await makeRequest('GET', '/ai/usage');
  if (usageAtLimit.status === 200) {
    console.log('✅ Usage à la limite:', usageAtLimit.data);
  }

  // 8. Tenter une 11ème génération (devrait être bloquée)
  console.log('\n🚫 8. Test de la 11ème génération (devrait être bloquée)...');
  const blockedTest = await makeRequest('POST', '/ai/test-limit', {
    prompt: 'Test limite dépassée',
    simulate: 'success'
  });
  
  if (blockedTest.status === 429) {
    console.log('✅ Limitation fonctionnelle! Réponse 429:', {
      error: blockedTest.data.error,
      message: blockedTest.data.message,
      limit: blockedTest.data.limit
    });
  } else {
    console.log('❌ La limitation ne fonctionne pas:', blockedTest);
  }

  // 9. Vérification finale de l'usage
  console.log('\n📊 9. Vérification finale de l\'usage...');
  const finalUsage = await makeRequest('GET', '/ai/usage');
  if (finalUsage.status === 200) {
    console.log('✅ Usage final:', finalUsage.data);
  }

  console.log('\n🎉 Tests terminés!');
}

// Vérifier si fetch est disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Ce script nécessite Node.js 18+ avec fetch natif');
  console.log('   ou installez node-fetch: npm install node-fetch');
  process.exit(1);
}

// Lancer les tests
runTests().catch(console.error);
