import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "../auth/SignUp";
import SignIn from "../auth/SignIn";
import PrivateRoute from "../auth/PrivateRoute";
import AppContent from "../components/AppContent";
import { AuthProvider } from "../context/AuthContext";
import { ProjectProvider } from "../context/ProjectContext";

const Router = () => {
	return (
		<BrowserRouter>
			<AuthProvider>
				<ProjectProvider>
					<Routes>
						<Route path="/signin" element={<SignIn />} />
						<Route path="/signup" element={<SignUp />} />
						<Route
							path="/"
							element={
								<PrivateRoute>
									<AppContent />
								</PrivateRoute>
							}
						/>
						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</ProjectProvider>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default Router;
