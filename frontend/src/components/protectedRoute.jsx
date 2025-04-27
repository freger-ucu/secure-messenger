import { Navigate } from "react-router";
import { getTokens } from "../utilities/auth"; // Import the token utility

const ProtectedRoute = ({ children }) => {
  const { accessToken } = getTokens();
  const priv = sessionStorage.getItem('privateKeyJwk');
  if (!accessToken || !priv) {
    return <Navigate to="/login" replace/>
  }
  return children
}


export default ProtectedRoute;
