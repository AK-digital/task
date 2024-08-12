import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Cookies from "js-cookie";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../assets/css/signin.css";

const API_BASE_URL = "http://localhost:5000/api";

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
        const response = await axios.get(
          `${API_BASE_URL}/users?email=${user.email}`
        );
        let dbUser;
        if (response.data.length > 0) {
          dbUser = response.data[0];
          await axios.put(`${API_BASE_URL}/users/${dbUser.id}`, {
            ...dbUser,
            authToken: token,
          });
        } else {
          dbUser = {
            id: user.uid,
            name: user.displayName || email.split("@")[0],
            email: user.email,
            authToken: token,
            profile_picture: user.photoURL || "",
          };
          await axios.post(`${API_BASE_URL}/users`, dbUser);
        }

        setCurrentUser(dbUser);
      } catch (dbError) {
        console.error(
          "Erreur lors de la mise à jour du token dans la base de données:",
          dbError
        );
      }

      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Email ou mot de passe incorrect");
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
            autoComplete="current-password"
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Se connecter</button>
        </form>
        <p className="signup-link">
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
