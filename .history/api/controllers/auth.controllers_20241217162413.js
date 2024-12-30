
import bcrypt from "bcrypt"
import userModel from "../models/user.model.js";



// Logic for user sign up.
export async function signUp(req, res, next) {
    try {

        const { lastName, firstName, email, password } = req.body;
        console.log(req.body.lastName)

        if (!lastName || !firstName || !email || !password) {
            return res.status(400).send({ success: false, message: "Paramètres invalides" });
        };

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new userModel({
            lastName: lastName,
            firstName: firstName,
            email: email,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        return res.status(201).send({ success: true, message: "Utilisateur créée avec succès", data: savedUser })
    } catch (err) {
        return res.status(500).send({ success: false, message: err.message || "Une erreur inattendue est survenue" });
    }
};

// Logic for user sign in.
export function signIn(req, res, next) {
    const { email, password } = req.body;
};

// Refreshing the access token by giving a valid refresh token.
export function refreshAccessToken(req, res, next) {

};

// Logic for user logout by deleting the user refresh token and blacklisting the access token
export function logout(req, res, next) {

};

