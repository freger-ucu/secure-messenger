import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { Input, Button, Alert, Typography, message, Flex, Form } from "antd";
import { Link, useNavigate } from "react-router";
import { deriveSymKey, decryptPrivateKey } from "../../utilities/crypto";

const { Title, Text } = Typography;

// Constants
const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `http://${API_BASE}/auth/login/`;

// Validation Schema
const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// Form Field Component
const FormField = ({ name, control, errors, type = "text", placeholder }) => (
  <Form.Item style={{ marginBottom: 0 }}>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        type === "password" ? (
          <Input.Password {...field} placeholder={placeholder} size="large" />
        ) : (
          <Input {...field} type={type} placeholder={placeholder} size="large" />
        )
      )}
    />
    {errors[name] && (
      <Text type="danger" style={{ fontSize: "14px", marginTop: "4px" }}>
        {errors[name].message}
      </Text>
    )}
  </Form.Item>
);

// API call function with proper error extraction
export const loginUser = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Extract the error message from the 'detail' property
      const errorDetail = result.detail || "Login failed";      
      throw new Error(errorDetail);
    }

    return result;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error("Network Error");
    }
    throw error;
  }
};

export default function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Perform login and store tokens
      const result = await loginUser(data);
      
      const { access, refresh } = result;
      sessionStorage.setItem("accessToken", access);
      sessionStorage.setItem("refreshToken", refresh);
      sessionStorage.setItem("username", data.username);

      try {
        // Fetch encrypted key pair from server
        const keysRes = await fetch(`http://${API_BASE}/api/keys/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });
        
        if (!keysRes.ok) {
          const keyError = await keysRes.json();
          throw new Error(keyError.detail || "Failed to fetch user keys");
        }
        
        const keyData = await keysRes.json();

        // Derive symmetric key and decrypt private key
        try {
          const symKey = await deriveSymKey(data.password, keyData.salt);
          const privJwk = await decryptPrivateKey(
            keyData.encrypted_private_key,
            symKey,
            keyData.iv
          );

          // Store key pair in sessionStorage
          sessionStorage.setItem("privateKeyJwk", JSON.stringify(privJwk));
          sessionStorage.setItem("publicKeyJwk", JSON.stringify(keyData.public_key));
        } catch (cryptoError) {
          console.error("Crypto error:", cryptoError);
          throw new Error("Decryption Error");
        }
      } catch (keyError) {
        console.error("Key fetching error:", keyError);
        throw new Error(keyError.message || "Key Retrieval Error");
      }

      message.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      
      // Error message mapping using the correct error messages from the API
      const errorMessageMap = {
        "No active account found with the given credentials": "Incorrect username or password. Please try again.",
        "User not found": "This account doesn't exist. Please check your username or sign up.",
        "Account is locked": "Your account has been locked. Please reset your password or contact support.",
        "Network Error": "Unable to connect to the server. Please check your internet connection.",
        "Decryption Error": "Failed to decrypt your keys. Please ensure your password is correct.",
        "Key Retrieval Error": "Couldn't retrieve your security keys. Please try again or contact support.",
        "Account is inactive": "Your account is inactive. Please check your email to activate your account.",
        "Too many login attempts": "Too many failed login attempts. Please try again later or reset your password.",
        "Server Error": "Our servers are experiencing issues. Please try again later."
      };
      
      const errorMessage = errorMessageMap[err.message] || `Login failed: ${err.message}`;
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: "100vh", padding: "0 16px" }}
    >
      <Flex vertical style={{ width: "100%", maxWidth: "400px" }} gap="middle">
        <Title level={2} style={{ textAlign: "center", margin: "0 0 24px" }}>
          Log In
        </Title>

        <form onSubmit={handleSubmit(handleLogin)} style={{ width: "100%" }}>
          <Flex vertical gap="large">
            <Flex vertical gap="small">
              <FormField
                name="username"
                control={control}
                errors={errors}
                placeholder="Username"
              />
            </Flex>

            <Flex vertical gap="small">
              <FormField
                name="password"
                type="password"
                control={control}
                errors={errors}
                placeholder="Password"
              />
            </Flex>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Log In
            </Button>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginTop: "8px" }}
              />
            )}
          </Flex>
        </form>


        <Flex justify="center" style={{ marginTop: "8px" }}>
          <Text>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#1890ff" }}>
              Sign Up
            </Link>
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}