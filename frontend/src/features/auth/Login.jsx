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

// API call function
export const loginUser = async (data) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
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

      // Fetch encrypted key pair from server
      const keysRes = await fetch(`http://${API_BASE}/api/keys/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
      if (!keysRes.ok) throw new Error("Failed to fetch user keys");
      const keyData = await keysRes.json();

      // Derive symmetric key and decrypt private key
      const symKey = await deriveSymKey(data.password, keyData.salt);
      const privJwk = await decryptPrivateKey(
        keyData.encrypted_private_key,
        symKey,
        keyData.iv
      );

      // Store key pair in sessionStorage
      sessionStorage.setItem("privateKeyJwk", JSON.stringify(privJwk));
      sessionStorage.setItem("publicKeyJwk", JSON.stringify(keyData.public_key));

      message.success("Login successful!");
      navigate("/");
    } catch (err) {
      setError(err.message);
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

        <Button
          type="dashed"
          size="large"
          block
          onClick={() => navigate("/restore")}
        >
          Restore Account
        </Button>

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
