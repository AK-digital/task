import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import { validators } from '../utils/validators';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { signInWithSSO, signUp } from '../store/slices/authSlice';

const SignUp = () => {
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validators.isValidEmail(formData.email)) {
      return; // Géré par le hook useAppDispatch
    }

    if (!validators.isValidPassword(formData.password)) {
      return; // Géré par le hook useAppDispatch
    }

    if (formData.password !== formData.confirmPassword) {
      return; // Géré par le hook useAppDispatch
    }

    try {
      await appDispatch(
        signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.email.split('@')[0]
        }),
        {
          successMessage: "Compte créé avec succès",
          errorMessage: "Erreur lors de la création du compte"
        }
      );
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
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
      console.error("Erreur d'authentification SSO:", error);
    }
  };

  return (
    <div className="signup-container">
      <h1>täsk</h1>
      <div className="signup-form-wrapper">
        <h2>Créer un compte</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nom (optionnel)"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            required
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmer le mot de passe"
            required
            autoComplete="new-password"
          />
          <button type="submit">S'inscrire</button>
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

        <p className="signin-link">
          Déjà un compte ? <Link to="/signin">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;