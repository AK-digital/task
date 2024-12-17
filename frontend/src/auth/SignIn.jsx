import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { signIn, selectAuthError, selectAuthLoading } from '../store/slices/authSlice';
import { LoadingButton } from '../components/shared/LoadingSpinner';

function SignIn() {
  const appDispatch = useAppDispatch();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const authError = useSelector(selectAuthError);
  const isAuthLoading = useSelector(selectAuthLoading);

  // Local state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset error when inputs change
  useEffect(() => {
    if (error || authError) {
      setError(null);
    }
  }, [formData.email, formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Tentative de connexion...', {
        email: formData.email,
        timestamp: new Date().toISOString()
      });

      const result = await appDispatch(
        signIn({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      );

      console.log('Résultat de la connexion:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la connexion');
      }

      console.log('Connexion réussie, redirection...');
      navigate("/");
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <h1>täsk</h1>
      <div className="signin-form-wrapper">
        <h2>Connexion</h2>
        {(error || authError) && (
          <div className="error-message" role="alert">
            {error || authError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              required
              disabled={isLoading || isAuthLoading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              autoComplete="current-password"
              required
              disabled={isLoading || isAuthLoading}
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading || isAuthLoading}
              />
              Se souvenir de moi
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>

          <LoadingButton
            type="submit"
            isLoading={isLoading || isAuthLoading}
            disabled={isLoading || isAuthLoading}
            className="signin-button"
          >
            Se connecter
          </LoadingButton>
        </form>

        <p className="signup-link">
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;