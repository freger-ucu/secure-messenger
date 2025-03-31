import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router"; // <-- Use BrowserRouter here!

import LoginPage from "./features/auth/Login.jsx";
import SignUpPage from "./features/auth/SignUp.jsx";
import NotFoundPage from "./features/NotFound.jsx";

import "./index.css";
import SeedPhraseRestoration from "./features/auth/SeedPhraseRestoration.jsx";
import Chat from "./features/chat/chat.jsx";

import ProtectedRoute from "./components/protectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/restore" element={<SeedPhraseRestoration />} />
      {/* Protect Chat Route */}
      <Route
        path="/chat"
        element={ <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
        } />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Router>
);
