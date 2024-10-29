import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SignIn from "./auth/SignIn.jsx";
import SignUp from "./auth/SignUp.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./auth/PrivateRoute.jsx";
import AppContent from "./components/AppContent.jsx";
import FontLoader from "./FontLoader.jsx";
import "./assets/css/common.css";
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);


function App() {
  return (
    <>
      <FontLoader />
      <Router>
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
      </Router>
    </>
  );
}

export default App;
