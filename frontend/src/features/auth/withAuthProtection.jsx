// src/components/Auth/withAuthProtection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Flex, Spin } from "antd";
import { useAuthToken } from "../chat/hooks/useAuthToken";

// Higher-order component to protect routes that require authentication
export const withAuthProtection = (Component) => {
  return function ProtectedRoute(props) {
    const { isAuthenticated, tokenLoading } = useAuthToken();
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      // Check if user is authenticated
      const checkAuth = async () => {
        if (!isAuthenticated) {
          navigate("/login", { replace: true });
        }
        setIsChecking(false);
      };

      checkAuth();
    }, [isAuthenticated, navigate]);

    if (isChecking || tokenLoading) {
      return (
        <Flex justify="center" align="center" style={{ height: "100vh" }}>
          <Spin size="large" tip="Verifying your session..." />
        </Flex>
      );
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
};
