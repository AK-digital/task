import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import { useAppDispatch } from '../hooks/useAppDispatch';
import { signUp, signInWithSSO } from '../store/slices/authSlice';
import { LoadingButton } from '../components/shared/LoadingSpinner';
import { validators } from '../utils/validators';

const SignUp = () => {
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!validators.isValidEmail(formData.email)) {
      setError('Adresse email invalide');
      return false;
    }

    if (!validators.isValidPassword(formData.password)) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await appDispatch(
        signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name
        }),
        {
          successMessage: 'Compte créé avec succès',
          errorMessage: 'Erreur lors de la création du compte'
        }
      );

      if (result.error) {
        throw new Error(result.error);
      }

      navigate("/");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOSignIn = async (provider) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await appDispatch(
        signInWithSSO(provider),
        {
          successMessage: 'Connexion réussie',
          errorMessage: `Erreur lors de la connexion avec ${provider}`
        }
      );

      if (result.error) {
        throw new Error(result.error);
      }

      navigate("/");
    } catch (error) {
      console.error(`Erreur lors de la connexion ${provider}:`, error);
      setError(error.message || `Une erreur est survenue lors de la connexion avec ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h1>täsk</h1>
      <div className="signup-form-wrapper">
        <h2>Créer un compte</h2>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nom (optionnel)"
            disabled={isLoading}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            autoComplete="email"
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmer le mot de passe"
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            S'inscrire
          </LoadingButton>
        </form>

        <div className="separator">
          <span>ou</span>
        </div>

        <div className="sso-buttons">
          <button
            className="google-signin"
            onClick={() => handleSSOSignIn('google')}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faGoogle} />
            Continuer avec Google
          </button>
          <button
            className="github-signin"
            onClick={() => handleSSOSignIn('github')}
            disabled={isLoading}
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