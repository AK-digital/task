import { z } from "zod";
import { regex } from "../utils/regex.js";

export const signUpValidation = z.object({
  lastName: z
    .string()
    .min(2, "Le nom de famille doit contenir au moins 2 caractères")
    .max(50, "Le nom de famille ne peut pas dépasser 50 caractères"),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .min(1)
    .max(50)
    .regex(regex.email, "L'adresse mail saisie est invalide"),
  password: z
    .string()
    .regex(regex.password, "Le mot de passe saisi est invalide"),
});

export const signInValidation = z.object({
  email: z
    .string()
    .min(1)
    .max(50)
    .regex(regex.email, "L'adresse mail saisie est invalide"),
  password: z
    .string()
    .regex(regex.password, "Le mot de passe saisi est invalide"),
});

export const userUpdateValidation = z.object({
  lastName: z
    .string()
    .min(2, "Le nom de famille doit contenir au moins 2 caractères")
    .max(50, "Le nom de famille ne peut pas dépasser 50 caractères"),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .min(1)
    .max(50)
    .regex(regex.email, "L'adresse mail saisie est invalide"),
  password: z
    .string()
    .regex(regex.password, "Le mot de passe saisi est invalide"),
});
