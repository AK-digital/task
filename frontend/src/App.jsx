import React from "react";
import FontLoader from "./FontLoader.jsx";
import "./assets/css/common.css";
import Router from "./routes/Router.jsx";
import ToastContainer from './components/shared/ToastContainer';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ModalManager from './components/shared/ModalManager';

function App() {
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