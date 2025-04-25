import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { Input, Button, Alert, Typography, message, Flex, Form } from "antd";
import { Link, useNavigate } from "react-router"; // Fix import

const { Title, Text } = Typography;

// Validation Schema
const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// Helper functions
const arrayBufferToBase64 = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const generateAndSaveKeypair = async (accessToken) => {
  // Generate keypair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export public & private key
  const exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  // Save private key locally (in localStorage)
  localStorage.setItem("privateKey", arrayBufferToBase64(exportedPrivateKey));

  // Send public key to backend
  await fetch("http://127.0.0.1:8000/api/public-key/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      public_key: arrayBufferToBase64(exportedPublicKey)
    })
  });

  console.log("Public key sent to backend successfully!");
  message.success("Public key sent to backend successfully!");
};

// Reusable form field component
const FormField = ({ name, control, errors, type = "text", placeholder }) => (
  <Flex vertical gap="small">
    <Form.Item style={{ marginBottom: 0 }}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          type === "password" ?
            <Input.Password {...field} placeholder={placeholder} size="large" /> :
            <Input {...field} type={type} placeholder={placeholder} size="large" />
        )}
      />
      {errors[name] && (
        <Text type="danger" style={{ fontSize: "14px", marginTop: "4px" }}>
          {errors[name].message}
        </Text>
      )}
    </Form.Item>
  </Flex>
);

export default function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Save tokens and username
      sessionStorage.setItem("accessToken", result.access);
      sessionStorage.setItem("refreshToken", result.refresh);
      sessionStorage.setItem("username", data.username);

      message.success("Login successful!");

      // Handle keypair generation and storage
      await generateAndSaveKeypair(result.access);

      // Redirect user to chat page
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

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <Flex vertical gap="large">
            <FormField
              name="username"
              control={control}
              errors={errors}
              placeholder="Username"
            />

            <FormField
              name="password"
              control={control}
              errors={errors}
              type="password"
              placeholder="Password"
            />

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