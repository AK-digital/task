import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGoogle,
    faGithub,
    faLinkedin
} from "@fortawesome/free-brands-svg-icons";
import { faSignOutAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../hooks/useModal';
import { LoadingButton } from '../shared/LoadingSpinner';
import { validators } from '../../utils/validators';
import {
    signIn,
    signInWithSSO,
    logout,
    selectCurrentUser,
    selectAuthLoading,
    selectAuthError
} from '../../store/slices/authSlice';
import { clearProjects } from '../../store/slices/projectSlice';
import { clearNotifications } from '../../store/slices/notificationSlice';

export const SignIn = () => {
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const { showModal } = useModal();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!validators.isValidEmail(email)) {
            showModal('error', { message: 'Email invalide' });
            return;
        }

        if (!validators.isValidPassword(password)) {
            showModal('error', {
                message: 'Le mot de passe doit faire au moins 6 caractères'
            });
            return;
        }

        try {
            await appDispatch(
                signIn({ email, password, rememberMe }),
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
            console.error("Erreur d'authentification SSO:", error);
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
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        autoComplete="current-password"
                        required
                    />

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Se souvenir de moi
                        </label>
                        <a href="#" className="forgot-password">
                            Mot de passe oublié ?
                        </a>
                    </div>

                    <LoadingButton
                        type="submit"
                        isLoading={loading}
                        className="signin-btn"
                    >
                        Se connecter
                    </LoadingButton>
                </form>

                <div className="separator">
                    <span>ou</span>
                </div>

                <div className="sso-buttons">
                    <button
                        className="google-signin"
                        onClick={() => handleSSOSignIn('google')}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faGoogle} />
                        Se connecter avec Google
                    </button>
                    <button
                        className="github-signin"
                        onClick={() => handleSSOSignIn('github')}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faGithub} />
                        Se connecter avec GitHub
                    </button>
                    <button
                        className="linkedin-signin"
                        onClick={() => handleSSOSignIn('linkedin')}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faLinkedin} />
                        Se connecter avec LinkedIn
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SignOut = () => {
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const { showConfirmation } = useModal();

    const handleSignOut = async () => {
        showConfirmation(
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            async () => {
                try {
                    await appDispatch(logout());

                    // Nettoyage du state
                    dispatch(clearProjects());
                    dispatch(clearNotifications());

                    navigate("/signin");
                } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                }
            }
        );
    };

    return (
        <FontAwesomeIcon
            className="signout-icon"
            icon={faSignOutAlt}
            onClick={handleSignOut}
            title="Se déconnecter"
        />
    );
};

export const PrivateRoute = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);
    const loading = useSelector(selectAuthLoading);

    if (loading) {
        return (
            <div className="auth-loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Vérification de l'authentification...</span>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/signin" />;
    }

    return children;
};