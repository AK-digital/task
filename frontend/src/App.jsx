import React, { useEffect } from "react";
import FontLoader from "./FontLoader.jsx";
import "./assets/css/common.css";
import Router from "./routes/Router.jsx";
import ToastContainer from './components/shared/ToastContainer';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ModalManager from './components/shared/ModalManager';
import { testConnection } from './config/firebase';
import useAuth from './hooks/useAuth';

function App() {
	const { isLoading } = useAuth();

	useEffect(() => {
		testConnection()
			.then(status => console.log('Firebase status:', status))
			.catch(error => console.error('Firebase error:', error));
	}, []);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<>
			<FontLoader />
			<Router />
			<ToastContainer />
			<LoadingSpinner />
			<ModalManager />
		</>
	);
}

export default App;