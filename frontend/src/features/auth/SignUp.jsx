import { useState } from "react";
<<<<<<< HEAD
import { Input, Button, Alert, Typography, message } from "antd";
import { Link, useNavigate } from "react-router";
=======
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
} from "antd";
import { Link, useNavigate } from "react-router"; // Fix import
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
>>>>>>> origin/develop

// Validation Schema
const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
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
  first_name: yup.string().required("First name is required"),
});

// Function to generate a random 6-word seed phrase
const generateSeedPhrase = () => {
  const wordList = [
    "apple",
    "beach",
    "cloud",
    "dance",
    "earth",
    "field",
    "glass",
    "house",
    "image",
    "juice",
    "kite",
    "light",
    "music",
    "north",
    "ocean",
    "paper",
    "queen",
    "river",
    "stone",
    "table",
    "unity",
    "voice",
    "water",
    "xenon",
    "yacht",
    "zebra",
    "above",
    "below",
    "circle",
    "design",
    "eagle",
    "flame",
    "garden",
    "hidden",
    "island",
    "jungle",
    "kingdom",
    "level",
    "mountain",
    "number",
    "orange",
    "planet",
    "quiet",
    "record",
    "sunset",
    "timber",
    "unique",
    "valley",
    "window",
    "xylophone",
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Call the backend registration endpoint
      const response = await fetch("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          password2: data.password2,
          first_name: data.first_name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Generate and display the seed phrase after successful registration
      const newSeedPhrase = generateSeedPhrase();
      setSeedPhrase(newSeedPhrase);
      setSeedPhraseModalVisible(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(seedPhrase)
      .then(() => {
        setCopied(true);
        message.success("Seed phrase copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        message.error("Failed to copy seed phrase");
      });
  };

  const handleModalClose = () => {
    setSeedPhraseModalVisible(false);
    // Redirect to login page after closing the modal
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

            {/* First Name Field */}
            <Flex vertical gap="small">
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your first name"
                      size="large"
                    />
                  )}
                />
                {errors.first_name && (
                  <Text
                    type="danger"
                    style={{ fontSize: "14px", paddingTop: "4px" }}
                  >
                    {errors.first_name.message}
                  </Text>
                )}
              </Form.Item>
            </Flex>

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

            {/* Error Message */}
            {error && <Alert message={error} type="error" showIcon />}

            {/* Link to Login Page */}
            <Flex justify="center" style={{ paddingTop: "12px" }}>
              <Text>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#1890ff" }}>
                  Log In
                </Link>
              </Text>
            </Flex>
          </Flex>
        </form>
      </Flex>

      {/* Seed Phrase Modal */}
      <Modal
        title="Important: Save Your Seed Phrase"
        open={seedPhraseModalVisible}
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

          <Flex
            style={{
              position: "relative",
              padding: "16px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
            align="center"
            justify="center"
          >
            <Text strong style={{ fontSize: "18px", fontFamily: "monospace" }}>
              {seedPhrase}
            </Text>
            <Button
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              type="text"
              onClick={handleCopy}
              style={{ position: "absolute", top: "8px", right: "8px" }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </Flex>

          <Text type="secondary">
            Please write down these 6 words in order and store them securely
            offline. You will need this seed phrase to recover your account.
          </Text>
        </Flex>
      </Modal>
    </Flex>
  );
}
