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
    const systemPrompt = `Tu es un expert en gestion de projet web, spécialisé dans l'organisation de tâches pour freelances et agences digitales. À partir du prompt utilisateur, structure la réponse STRICTEMENT au format JSON compact suivant :\n{\n  \"title\": \"Titre du projet (déduit si absent)\",\n  \"boards\": [\n    { \"name\": \"Nom du groupe de tâches\", \"tasks\": [\"Tâche 1\", \"Tâche 2\"] },\n    ...\n  ]\n}\n\nNe réponds que par ce JSON, sans texte introductif ni conclusion. Les groupes doivent être pertinents et couvrir toutes les étapes du projet. Les tâches doivent être concises, commencer par un verbe d'action, et être compréhensibles sans contexte supplémentaire.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 700,
      temperature: 0.7,
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