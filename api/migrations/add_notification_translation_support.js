import mongoose from "mongoose";
import NotificationModel from "../models/Notification.model.js";

async function migrateNotifications() {
  try {
    console.log("Début de la migration des notifications...");

    // Migrer les notifications existantes
    const notifications = await NotificationModel.find({
      $or: [
        { "message.title": { $exists: true } },
        { type: { $exists: false } },
      ],
    });

    for (const notification of notifications) {
      let type = "generic";
      let params = {};

      // Si l'ancienne structure existe
      if (notification.message?.title || notification.message?.content) {
        const oldTitle = notification.message?.title || "";

        // Détecter le type basé sur le contenu
        if (oldTitle.includes("mentionné") || oldTitle.includes("mentioned")) {
          type = "mention";
          params = { projectName: "Projet" }; // Valeur par défaut
        } else if (oldTitle.includes("réagi") || oldTitle.includes("reacted")) {
          type = "reaction";
          params = { emoji: "👍", type: "message" }; // Valeurs par défaut
        }

        // Mettre à jour avec la nouvelle structure
        await NotificationModel.findByIdAndUpdate(notification._id, {
          $set: { type, params },
          $unset: { message: "" },
        });
      } else if (!notification.type) {
        // Si pas de type défini, mettre "generic"
        await NotificationModel.findByIdAndUpdate(notification._id, {
          $set: { type: "generic", params: {} },
        });
      }
    }

    console.log(
      `Migration terminée. ${notifications.length} notifications mises à jour.`
    );
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
  }
}

// Exporter la fonction pour l'utiliser
export { migrateNotifications };

// Si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateNotifications().then(() => {
    process.exit(0);
  });
}
