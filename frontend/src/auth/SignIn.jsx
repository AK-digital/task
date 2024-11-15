import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "./firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";
import "../assets/css/signin.css";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function SignIn() {
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      Cookies.set("authToken", token, { expires: 7 });

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/by-email?email=${user.email}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();

        if (userData.length > 0) {
          const dbUser = userData[0];

          // Vérifier si l'email de l'utilisateur authentifié correspond à celui de la base de données
          if (dbUser.email === user.email) {
            // Mettre à jour le token dans la base de données
            await fetch(`${API_BASE_URL}/users/${dbUser.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                authToken: token,
              }),
            });

            setCurrentUser({
              ...dbUser,
              authToken: token,
            });

            navigate("/");
          } else {
            setError("Erreur d'authentification : l'email ne correspond pas.");
            Cookies.remove("authToken");
          }
        } else {
          setError("Utilisateur non trouvé dans la base de données.");
          Cookies.remove("authToken");
        }
      } catch (dbError) {
        console.error(
          "Erreur lors de la vérification de l'utilisateur dans la base de données:",
          dbError
        );
        setError("Erreur lors de la connexion. Veuillez réessayer.");
        Cookies.remove("authToken");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Email ou mot de passe incorrect");
    }
  };

  const handleSSOSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      Cookies.set("authToken", token, { expires: 7 });

      try {
        // Vérifier si l'utilisateur existe
        const response = await axios.get(`${API_BASE_URL}/users`, {
          params: { email: user.email }
        });

        if (!response.data || response.data.length === 0) {
          // Créer un nouvel utilisateur
          const newUser = {
            id: user.uid,
            email: user.email,
            name: user.displayName || 'Utilisateur',
            profilePicture: user.photoURL || "default-profile-pic.svg",
            authToken: token
          };
          await axios.post(`${API_BASE_URL}/users`, newUser);
        } else {
          // Mettre à jour le token
          const existingUser = response.data[0];
          await axios.patch(`${API_BASE_URL}/users/${existingUser.id}`, {
            authToken: token,
            name: user.displayName || existingUser.name,
            profilePicture: user.photoURL || existingUser.profilePicture
          });
        }
        navigate("/");
      } catch (error) {
        console.error("Erreur lors de la vérification/création de l'utilisateur:", error);
        setError("Erreur lors de la connexion. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion SSO:", error);
      setError(error.message);
    }
  };

  return (
    <div className="signin-container">
      <h1>täsk</h1>
      <div className="signin-form-wrapper">
        <h2>Connexion</h2>
        <form onSubmit={handleSignIn} className="signin-form">
          <input
            type="email"
            name="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoComplete="password"
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Se connecter</button>
        </form>
        <div className="sso-buttons">
          <button 
            className="google-signin"
            onClick={() => handleSSOSignIn(googleProvider)}
          >
            <FontAwesomeIcon icon={faGoogle} /> Se connecter avec Google
          </button>
          <button 
            className="github-signin"
            onClick={() => handleSSOSignIn(githubProvider)}
          >
            <FontAwesomeIcon icon={faGithub} /> Se connecter avec GitHub
          </button>
        </div>
        <p className="signup-link">
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
