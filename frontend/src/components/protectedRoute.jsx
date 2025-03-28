import { Navigate } from "react-router";
import { getTokens } from "../utilities/auth"; // Import the token utility

const ProtectedRoute = ({ children }) => {
  const { accessToken } = getTokens();

  if (!accessToken) {
    // Redirect to login if no access token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
