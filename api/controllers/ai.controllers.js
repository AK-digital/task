import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/generate-board
 * Body: { prompt: string }
 * Retourne un titre de projet, des groupes (boards) et leurs tâches générés par l'IA
 */
export const generateBoard = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant." });
  }
  try {
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
    // Extraction du JSON (robuste)
    let jsonStart = aiText.indexOf('{');
    let jsonEnd = aiText.lastIndexOf('}');
    let parsed = null;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        parsed = JSON.parse(aiText.slice(jsonStart, jsonEnd + 1));
      } catch (e) {
        return res.status(500).json({ error: "Erreur de parsing JSON IA", raw: aiText });
      }
    } else {
      return res.status(500).json({ error: "Réponse IA non structurée en JSON", raw: aiText });
    }
    res.json(parsed);
  } catch (error) {
    console.error("Erreur OpenAI:", error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors de la génération IA." });
  }
}; 