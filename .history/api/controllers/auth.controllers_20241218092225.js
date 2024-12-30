
import bcrypt from "bcrypt"
import UserModel from "../models/user.model.js";
import { signInValidation, signUpValidation } from "../helpers/zod.js";

// Logic for user sign up.
export async function signUp(req, res, next) {
    try {
        const { lastName, firstName, email, password } = req.body;

        // Checks if a body value is missing.
        if (!lastName || !firstName || !email || !password) {
            return res.status(400).send({ success: false, message: "Paramètres invalides" });
        };

        // Zod validation to check if data are valid.
        const validation = signUpValidation.safeParse({ lastName, firstName, email, password });

        if (!validation.success) {
            const { errors } = validation.error;

            return res.status(400).send({ success: false, message: "Paramètres invalides", errors: errors });
        };

        const hashedPassword = await bcrypt.hash(password, 10); // Hashing user password before saving it.

        const user = new UserModel({
            lastName: lastName,
            firstName: firstName,
            email: email,
            password: hashedPassword, // Pass the hashed password
        });

        const savedUser = await user.save(); // Save user in DB.

        return res.status(201).send({ success: true, message: "Utilisateur créée avec succès", data: savedUser });
    } catch (err) {
        return res.status(500).send({ success: false, message: err.message || "Une erreur inattendue est survenue" });
    };
};

// Logic for user sign in.
export async function signIn(req, res, next) {
    try {
        const { email, password } = req.body

        // Checks if a body value is missing.
        if (!email || !password) {
            return res.status(400).send({ success: false, message: "Paramètres invalides" });
        };

        // Zod validation to check if data are valid.
        const validation = signInValidation.safeParse({ email, password });

        if (!validation.success) {
            const { errors } = validation.error;

            return res.status(400).send({ success: false, message: "Paramètres invalides", errors: errors });
        };

        const user = await UserModel.findOne({ email: email }); // Get the user based on the given email.

        // Checks if an user is returned.
        if (!user) {
            return res.status(404).send({ success: true, message: "Aucun utilisateur correspondant à l'adresse mail saisie" });
        };

        // If an user is returned 
        const passwordMatch = await bcrypt.compare(password, user?.password);

        // If the password does not match with the returned user then return an error.
        if (!passwordMatch) {
            return res.status(404).send({ success: true, message: "Le mot de passe saisi est invalide" });
        };

    } catch (err) {
        return res.status(500).send({ success: false, message: err.message || "Une erreur inattendue est survenue" });
    };
};

// Refreshing the access token by giving a valid refresh token.
export function refreshAccessToken(req, res, next) {

};

// Logic for user logout by deleting the user refresh token and blacklisting the access token
export function logout(req, res, next) {

};

