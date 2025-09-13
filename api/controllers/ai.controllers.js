import OpenAI from "openai";
import dotenv from "dotenv";
import AIUsage from "../models/AIUsage.model.js";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Limite quotidienne de génération de projets par utilisateur
const DAILY_PROJECT_GENERATION_LIMIT = 10;

/**
 * Vérifie si l'utilisateur a atteint sa limite quotidienne de génération de projets
 */
const checkDailyLimit = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const usageCount = await AIUsage.countDocuments({
    userId: userId,
    type: "project_generation",
    success: true,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  return usageCount >= DAILY_PROJECT_GENERATION_LIMIT;
};

/**
 * Enregistre l'utilisation de l'IA
 */
const logAIUsage = async (userId, prompt, success = true, errorMessage = null, tokensUsed = 0) => {
  try {
    const aiUsage = new AIUsage({
      userId,
      type: "project_generation",
      prompt,
      success,
      errorMessage,
      tokensUsed,
    });
    await aiUsage.save();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'usage IA:", error);
  }
};

/**
 * POST /api/ai/generate-board
 * Body: { prompt: string }
 * Retourne un titre de projet, des groupes (boards) et leurs tâches générés par l'IA
 */
export const generateBoard = async (req, res) => {
  const { prompt } = req.body;
  const userId = res.locals.user._id;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant." });
  }

  try {
    // Vérifier la limite quotidienne
    const hasReachedLimit = await checkDailyLimit(userId);
    if (hasReachedLimit) {
      await logAIUsage(userId, prompt, false, "Limite quotidienne atteinte");
      return res.status(429).json({ 
        error: "Limite quotidienne atteinte", 
        message: `Vous avez atteint votre limite de ${DAILY_PROJECT_GENERATION_LIMIT} générations de projets par jour. Réessayez demain.`,
        limit: DAILY_PROJECT_GENERATION_LIMIT,
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      });
    }
    const systemPrompt = `Tu es un expert en gestion de projet web et digital, spécialisé dans l'organisation de tâches pour freelances et agences. À partir du prompt utilisateur, crée une structure de projet COMPLÈTE et DÉTAILLÉE.

INSTRUCTIONS IMPORTANTES :
- Sois créatif et propose des tableaux et tâches pertinents même s'ils ne sont pas explicitement mentionnés dans le prompt
- Pense à TOUS les aspects d'un projet professionnel : planification, conception, développement, tests, déploiement, marketing, suivi, etc.
- Propose entre 4 et 8 tableaux selon la complexité du projet
- Chaque tableau doit contenir entre 5 et 15 tâches détaillées
- Inclus des tâches de gestion de projet, de communication client, de documentation, etc.
- Pense aux bonnes pratiques, à la qualité, aux tests, à la sécurité, au SEO, etc.

Format de réponse STRICTEMENT JSON :
{
  "title": "Titre du projet (déduit du contexte)",
  "boards": [
    { "name": "Nom du tableau", "tasks": ["Tâche détaillée 1", "Tâche détaillée 2", ...] },
    ...
  ]
}

Les tâches doivent être :
- Spécifiques et actionnables
- Commencer par un verbe d'action
- Suffisamment détaillées pour être comprises sans contexte
- Couvrir tous les aspects du projet (technique, business, communication, qualité)

Ne réponds que par ce JSON, sans texte introductif ni conclusion.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 2500,
      temperature: 0.8,
    });

    const aiText = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Extraction du JSON (robuste)
    let jsonStart = aiText.indexOf('{');
    let jsonEnd = aiText.lastIndexOf('}');
    let parsed = null;
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        parsed = JSON.parse(aiText.slice(jsonStart, jsonEnd + 1));
        
        // Enregistrer l'utilisation réussie
        await logAIUsage(userId, prompt, true, null, tokensUsed);
        
        res.json(parsed);
      } catch (e) {
        await logAIUsage(userId, prompt, false, "Erreur de parsing JSON IA", tokensUsed);
        return res.status(500).json({ error: "Erreur de parsing JSON IA", raw: aiText });
      }
    } else {
      await logAIUsage(userId, prompt, false, "Réponse IA non structurée en JSON", tokensUsed);
      return res.status(500).json({ error: "Réponse IA non structurée en JSON", raw: aiText });
    }
  } catch (error) {
    console.error("Erreur OpenAI:", error.response?.data || error.message);
    
    // Enregistrer l'échec
    await logAIUsage(userId, prompt, false, error.message || "Erreur OpenAI");
    
    res.status(500).json({ error: "Erreur lors de la génération IA." });
  }
};

/**
 * GET /api/ai/usage
 * Retourne l'utilisation quotidienne de l'utilisateur
 */
export const getUsage = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usageCount = await AIUsage.countDocuments({
      userId: userId,
      type: "project_generation",
      success: true,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const remainingUsage = Math.max(0, DAILY_PROJECT_GENERATION_LIMIT - usageCount);
    
    res.json({
      dailyLimit: DAILY_PROJECT_GENERATION_LIMIT,
      used: usageCount,
      remaining: remainingUsage,
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      hasReachedLimit: usageCount >= DAILY_PROJECT_GENERATION_LIMIT
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'usage:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'usage." });
  }
};

/**
 * POST /api/ai/test-limit
 * Route de test pour simuler l'utilisation de l'IA sans appeler OpenAI
 * Body: { prompt: string, simulate?: "success" | "error" | "parsing_error" }
 */
export const testLimit = async (req, res) => {
  const { prompt, simulate = "success" } = req.body;
  const userId = res.locals.user._id;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant." });
  }

  try {
    // Vérifier la limite quotidienne (même logique que generateBoard)
    const hasReachedLimit = await checkDailyLimit(userId);
    if (hasReachedLimit) {
      await logAIUsage(userId, prompt, false, "Limite quotidienne atteinte");
      return res.status(429).json({ 
        error: "Limite quotidienne atteinte", 
        message: `Vous avez atteint votre limite de ${DAILY_PROJECT_GENERATION_LIMIT} générations de projets par jour. Réessayez demain.`,
        limit: DAILY_PROJECT_GENERATION_LIMIT,
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      });
    }

    // Simuler différents scénarios selon le paramètre
    switch (simulate) {
      case "error":
        await logAIUsage(userId, prompt, false, "Erreur simulée pour test");
        return res.status(500).json({ 
          error: "Erreur simulée pour test",
          test: true 
        });

      case "parsing_error":
        await logAIUsage(userId, prompt, false, "Erreur de parsing simulée", 100);
        return res.status(500).json({ 
          error: "Erreur de parsing JSON IA simulée",
          test: true 
        });

      case "success":
      default:
        // Simuler une réponse réussie
        const mockResponse = {
          title: `Projet de test: ${prompt.substring(0, 50)}...`,
          boards: [
            {
              name: "Planification",
              tasks: [
                "Définir les objectifs du projet",
                "Analyser les besoins utilisateurs",
                "Créer le cahier des charges"
              ]
            },
            {
              name: "Développement",
              tasks: [
                "Configurer l'environnement de développement",
                "Développer les fonctionnalités principales",
                "Effectuer les tests unitaires"
              ]
            }
          ]
        };

        // Enregistrer l'utilisation réussie (avec des tokens simulés)
        await logAIUsage(userId, prompt, true, null, 150);
        
        return res.json({
          ...mockResponse,
          test: true,
          message: "Réponse simulée - aucun appel OpenAI effectué"
        });
    }
  } catch (error) {
    console.error("Erreur lors du test:", error);
    await logAIUsage(userId, prompt, false, error.message || "Erreur de test");
    res.status(500).json({ error: "Erreur lors du test de limitation." });
  }
};

/**
 * DELETE /api/ai/reset-usage
 * Route de test pour réinitialiser l'usage quotidien d'un utilisateur
 * ⚠️ À utiliser uniquement en développement/test
 */
export const resetUsage = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Supprimer toutes les utilisations d'aujourd'hui
    const result = await AIUsage.deleteMany({
      userId: userId,
      type: "project_generation",
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.json({
      message: "Usage quotidien réinitialisé",
      deletedCount: result.deletedCount,
      test: true
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    res.status(500).json({ error: "Erreur lors de la réinitialisation." });
  }
}; 