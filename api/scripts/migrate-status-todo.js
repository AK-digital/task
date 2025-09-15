import mongoose from "mongoose";
import StatusModel from "../models/Status.model.js";

// Script de migration pour mettre à jour le champ todo des statuts existants
async function migrateStatusTodo() {
  try {
    console.log("🚀 Début de la migration des statuts...");

    // Mettre à jour tous les statuts avec status="todo" pour avoir todo=true
    const todoResult = await StatusModel.updateMany(
      { status: "todo" },
      { $set: { todo: true } }
    );

    console.log(`✅ ${todoResult.modifiedCount} statuts "todo" mis à jour avec todo=true`);

    // Mettre à jour tous les autres statuts pour avoir todo=false
    const otherResult = await StatusModel.updateMany(
      { status: { $ne: "todo" } },
      { $set: { todo: false } }
    );

    console.log(`✅ ${otherResult.modifiedCount} autres statuts mis à jour avec todo=false`);

    // Vérification
    const todoCount = await StatusModel.countDocuments({ todo: true });
    const nonTodoCount = await StatusModel.countDocuments({ todo: false });

    console.log(`📊 Résultat final:`);
    console.log(`   - Statuts Todo: ${todoCount}`);
    console.log(`   - Statuts Non-Todo: ${nonTodoCount}`);

    console.log("✅ Migration terminée avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  }
}

// Exporter la fonction pour pouvoir l'utiliser
export default migrateStatusTodo;

// Si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connexion à MongoDB (ajustez l'URL selon votre configuration)
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/clynt";
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("📦 Connecté à MongoDB");
      return migrateStatusTodo();
    })
    .then(() => {
      console.log("🎉 Migration terminée, fermeture de la connexion...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erreur:", error);
      process.exit(1);
    });
}


