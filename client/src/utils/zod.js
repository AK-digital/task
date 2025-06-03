import z from "zod";
import { regex } from "./regex";

// Fonction pour traduire les erreurs de validation après qu'elles soient générées
export function translateValidationErrors(errors, t) {
  if (!errors || !t) return errors;

  const errorTranslations = {
    "Le nom doit contenir au moins 2 caractères": t("validation.lastname_min"),
    "Le nom ne peut pas dépasser 50 caractères": t("validation.lastname_max"),
    "Le prénom doit contenir au moins 2 caractères": t(
      "validation.firstname_min"
    ),
    "Le prénom ne peut pas dépasser 50 caractères": t(
      "validation.firstname_max"
    ),
    "L'adresse e-mail saisie est invalide": t("validation.email_invalid"),
    "Le mot de passe doit contenir ": t("validation.password_contains"),
    "Le mot de passe saisi est invalide": t("validation.password_invalid"),
    "Le nom de l'entreprise ne peut pas dépasser 100 caractères": t(
      "validation.company_max"
    ),
    "Le poste ne peut pas dépasser 100 caractères": t(
      "validation.position_max"
    ),
  };

  // Fonction récursive pour traduire les erreurs
  function translateError(error) {
    if (typeof error === "string") {
      return errorTranslations[error] || error;
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

// Schémas de validation originaux
export const signUpSchema = z.object({
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .min(1)
    .max(50)
    .regex(regex.email, "L'adresse e-mail saisie est invalide"),
  password: z.string().regex(regex.password, "Le mot de passe doit contenir "),
});

export const signInSchema = z.object({
  email: z
    .string()
    .min(1)
    .max(50)
    .regex(regex.email, "L'adresse e-mail saisie est invalide"),
  password: z
    .string()
    .regex(regex.password, "Le mot de passe saisi est invalide"),
});

export const userUpdateValidation = z.object({
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  company: z
    .string()
    .max(100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères")
    .optional()
    .nullable(),
  position: z
    .string()
    .max(100, "Le poste ne peut pas dépasser 100 caractères")
    .optional()
    .nullable(),
});
