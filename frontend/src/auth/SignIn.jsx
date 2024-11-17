import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import { useAppDispatch } from '../hooks/useAppDispatch';
import { signInWithSSO, signIn } from '../store/slices/authSlice';
import Head from '../components/shared/Head';

function SignIn() {
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await appDispatch(
        signIn({ email, password }),
        {
          successMessage: 'Connexion réussie',
          errorMessage: 'Erreur lors de la connexion'
        }
      );
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  const handleSSOSignIn = async (provider) => {
    try {
      await appDispatch(
        signInWithSSO(provider),
        {
          successMessage: 'Connexion réussie',
          errorMessage: 'Erreur lors de la connexion SSO'
        }
      );
      navigate("/");
    } catch (error) {
      console.error("Erreur d'authentification:", error);
    }
  };

  return (
    <>
      <Head
        title="Connexion"
        description="Connectez-vous à täsk pour gérer vos projets et tâches"
        keywords="connexion, login, task management, projet"
      />

      <div className="signin-container">
        <h1>täsk</h1>
        <div className="signin-form-wrapper">
          <h2>Connexion</h2>
          <form onSubmit={handleSignIn} className="signin-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="username"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              autoComplete="current-password"
              required
            />
            <button type="submit">
              Se connecter
            </button>
          </form>

          <div className="separator">
            <span>ou</span>
          </div>

          <div className="sso-buttons">
            <button
              className="google-signin"
              onClick={() => handleSSOSignIn('google')}
            >
              <FontAwesomeIcon icon={faGoogle} />
              Continuer avec Google
            </button>
            <button
              className="github-signin"
              onClick={() => handleSSOSignIn('github')}
            >
              <FontAwesomeIcon icon={faGithub} />
              Continuer avec GitHub
            </button>
          </div>

          <p className="signup-link">
            Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default SignIn;