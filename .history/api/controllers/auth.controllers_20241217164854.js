
import bcrypt from "bcrypt"
import UserModel from "../models/user.model.js";
import { userValidation } from "../helpers/zod.js";



// Logic for user sign up.
export async function signUp(req, res, next) {
    try {
        const { lastName, firstName, email, password } = req.body;

        if (!lastName || !firstName || !email || !password) {
            return res.status(400).send({ success: false, message: "Paramètres invalides" });
        };

        const validation = userValidation.safeParse({ lastName, firstName, email, password })


        if (!validation.success) {
            const { errors } = validation.error;


            return res.status(400).send({ success: false, message: errors });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            lastName: lastName,
            firstName: firstName,
            email: email,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        return res.status(201).send({ success: true, message: "Utilisateur créée avec succès", data: savedUser });
    } catch (err) {
        return res.status(500).send({ success: false, message: err.message || "Une erreur inattendue est survenue" });
    };
};

// Logic for user sign in.
export function signIn(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ success: false, message: "Paramètres invalides" });
        };


    } catch (err) {

    };

};

// Refreshing the access token by giving a valid refresh token.
export function refreshAccessToken(req, res, next) {

};

// Logic for user logout by deleting the user refresh token and blacklisting the access token
export function logout(req, res, next) {

};

