import React from "react";
import FontLoader from "./FontLoader.jsx";
import "./assets/css/common.css";
import Router from "./routes/Router.jsx";
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

function App() {
	return (
		<>
			<FontLoader />
			<Router />
		</>
	);
}

export default App;
