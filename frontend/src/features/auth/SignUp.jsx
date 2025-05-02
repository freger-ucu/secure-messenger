import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Input,
  Button,
  Alert,
  Typography,
  message,
  Modal,
  Flex,
  Form,
  theme
} from "antd";
import { Link, useNavigate } from "react-router";
import { CopyOutlined } from "@ant-design/icons";
import { generateKeyPair, randomBase64, deriveSymKey, encryptPrivateKey } from "../../utilities/crypto";
import { loginUser } from "./Login.jsx";

const { Title, Text } = Typography;

// Validation Schema - Removed seedphrase as it's handled automatically
const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(150, "Username must be 150 characters or fewer")
    .matches(
      /^[a-zA-Z0-9@.+\-_]+$/,
      "Username can only contain letters, digits, and @/./+/-/_"
    ),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  password2: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

// Function to generate a random 6-word seed phrase
const generateSeedPhrase = () => {
  const wordList = [
    "apple", "beach", "cloud", "dance", "earth", "field", "glass", "house",
    "image", "juice", "kite", "light", "music", "north", "ocean", "paper",
    "queen", "river", "stone", "table", "unity", "voice", "water", "xenon",
    "yacht", "zebra", "above", "below", "circle", "design", "eagle", "flame",
    "garden", "hidden", "island", "jungle", "kingdom", "level", "mountain", 
    "number", "orange", "planet", "quiet", "record", "sunset", "timber",
    "unique", "valley", "window", "xylophone",
  ];

  const seedPhrase = [];
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    seedPhrase.push(wordList[randomIndex]);
  }

  return seedPhrase.join(" ");
};

export default function RegisterPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      password2: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const API_BASE = import.meta.env.VITE_API_URL;

  // Generate a seed phrase when component mounts
  useEffect(() => {
    setSeedPhrase(generateSeedPhrase());
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Generate encryption key pair and parameters
      const { publicKeyJwk, privateKeyJwk } = await generateKeyPair();
      const salt = randomBase64(16);
      const iv = randomBase64(12);
      const symKey = await deriveSymKey(data.password, salt);
      const encryptedPrivateKey = await encryptPrivateKey(privateKeyJwk, symKey, iv);

      // Register the user account
      const response = await fetch(`/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          password2: data.password2,
          seedphrase: seedPhrase,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages from the API
        if (result.username) {
          throw new Error(result.username[0]);
        } else if (result.password) {
          throw new Error(result.password[0]);
        } else if (result.detail) {
          throw new Error(result.detail);
        } else {
          throw new Error("Registration failed. Please try again.");
        }
      }

      // Auto-login to retrieve tokens
      const loginResult = await loginUser({ username: data.username, password: data.password });
      sessionStorage.setItem("accessToken", loginResult.access);
      sessionStorage.setItem("refreshToken", loginResult.refresh);
      sessionStorage.setItem("username", data.username);

      // Upload encrypted key pair to server
      await fetch(`/api/api/keys/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginResult.access}`,
        },
        body: JSON.stringify({
          public_key: publicKeyJwk,
          encrypted_private_key: encryptedPrivateKey,
          salt,
          iv,
        }),
      });

      setRegistrationSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      
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
      
      const errorMessage = errorMessageMap[err.message] || err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(seedPhrase)
      .then(() => {
        message.success("Seed phrase copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        message.error("Failed to copy seed phrase");
      });
  };

  const handleModalClose = () => {
    setRegistrationSuccess(false);
    // After saving seed phrase and keys, navigate to chat
    navigate("/login");
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: "100vh" }}
    >
      <Flex
        vertical
        style={{ width: "100%", maxWidth: "400px", padding: "24px" }}
      >
        <Title level={2} style={{ marginBottom: "24px", textAlign: "center" }}>
          Create an Account
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex vertical gap="large">
            {/* Username Field */}
            <Flex vertical gap="small">
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your username"
                      size="large"
                    />
                  )}
                />
                {errors.username && (
                  <Text
                    type="danger"
                    style={{ fontSize: "14px", paddingTop: "4px" }}
                  >
                    {errors.username.message}
                  </Text>
                )}
              </Form.Item>
            </Flex>

            {/* Password Field */}
            <Flex vertical gap="small">
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="Create a password"
                      size="large"
                    />
                  )}
                />
                {errors.password && (
                  <Text
                    type="danger"
                    style={{ fontSize: "14px", paddingTop: "4px" }}
                  >
                    {errors.password.message}
                  </Text>
                )}
              </Form.Item>
            </Flex>

            {/* Confirm Password Field */}
            <Flex vertical gap="small">
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="password2"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="Confirm your password"
                      size="large"
                    />
                  )}
                />
                {errors.password2 && (
                  <Text
                    type="danger"
                    style={{ fontSize: "14px", paddingTop: "4px" }}
                  >
                    {errors.password2.message}
                  </Text>
                )}
              </Form.Item>
            </Flex>

            {/* Error Message */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}

            {/* Submit Button */}
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Register
            </Button>

            {/* Link to Login Page */}
            <Flex justify="center" style={{ paddingTop: "12px" }}>
              <Text>
                Already have an account?{" "}
                <Link to="/login" style={{ color: token.colorLinkActive }}>
                  Log In
                </Link>
              </Text>
            </Flex>
          </Flex>
        </form>
      </Flex>

      {/* Success Modal with Seed Phrase */}
      <Modal
        title="Important: Save Your Seed Phrase"
        open={registrationSuccess}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleModalClose} block>
            I've Saved My Seed Phrase
          </Button>,
        ]}
        closable={false}
        maskClosable={false}
      >
        <Flex vertical gap="middle">
          <Alert
            message="Security Warning"
            description="Your seed phrase is the only way to recover your account if you forget your password. Write it down and keep it in a safe place. Never share it with anyone."
            type="warning"
            showIcon
          />

          <div
            style={{
              position: "relative",
              padding: token.paddingMD,
              backgroundColor: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              wordWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <Button
              icon={<CopyOutlined />}
              type="text"
              onClick={handleCopy}
              style={{
                position: "absolute",
                top: token.marginXS,
                right: token.marginXS,
                zIndex: 1,
                color: token.colorText,
              }}
            />
            <Text
              strong
              style={{
                fontSize: token.fontSizeLG,
                fontFamily: "monospace",
                display: "block",
                paddingRight: `calc(${token.controlHeightLG}px + ${token.marginXS}px)`,
                whiteSpace: "pre-wrap",
                color: token.colorText,
              }}
            >
              {seedPhrase}
            </Text>
          </div>

          <Text type="secondary">
            Please write down these 6 words in order and store them securely
            offline. You will need this seed phrase to recover your account.
          </Text>
        </Flex>
      </Modal>
    </Flex>
  );
}