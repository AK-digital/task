import { z } from "zod";
import i18n from "i18next";
import { zodI18nMap } from "zod-i18n-map";
// Importation des traductions Zod pour le français et l'anglais
import zodTranslationFr from "zod-i18n-map/locales/fr/zod.json";
import zodTranslationEn from "zod-i18n-map/locales/en/zod.json";
import { regex } from "./regex";

// Configuration des traductions Zod
export function setupZodI18n() {
  // Ajouter les traductions Zod aux ressources existantes
  if (i18n.hasResourceBundle("fr", "zod")) {
    i18n.removeResourceBundle("fr", "zod");
  }
  if (i18n.hasResourceBundle("en", "zod")) {
    i18n.removeResourceBundle("en", "zod");
  }

  i18n.addResourceBundle("fr", "zod", zodTranslationFr);
  i18n.addResourceBundle("en", "zod", zodTranslationEn);

  // Configurer Zod pour utiliser les traductions i18next
  z.setErrorMap(zodI18nMap);
}

// Schémas de validation avec messages d'erreur automatiquement traduits
export const signUpSchema = z.object({
  lastName: z.string().min(2).max(50),
  firstName: z.string().min(2).max(50),
  email: z.string().min(1).max(50).email(),
  password: z.string().regex(regex.password, {
    message: "validation.password_invalid",
  }),
});

export const signInSchema = z.object({
  email: z.string().min(1).max(50).email(),
  password: z.string().regex(regex.password, {
    message: "validation.password_invalid",
  }),
});

export const userUpdateValidation = z.object({
  lastName: z.string().min(2).max(50),
  firstName: z.string().min(2).max(50),
  company: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  language: z.enum(["fr", "en"]).optional(),
});

export const feedbackValidation = z.object({
  message: z.string().min(1).max(1200),
});

// Fonction utilitaire pour traduire les erreurs personnalisées
export function translateCustomErrors(errors, t) {
  if (!errors || !t) return errors;

  function translateError(error) {
    if (typeof error === "string") {
      // Traduire les clés personnalisées
      if (error.startsWith("validation.")) {
        return t(error);
      }
      return error;
    }

    if (Array.isArray(error)) {
      return error.map(translateError);
    }

    if (typeof error === "object" && error !== null) {
      const translated = {};
      for (const [key, value] of Object.entries(error)) {
        translated[key] = translateError(value);
      }
      return translated;
    }

    return error;
  }

  return translateError(errors);
}
