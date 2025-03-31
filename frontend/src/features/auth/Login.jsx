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
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Save tokens in session storage
      sessionStorage.setItem("accessToken", result.access);
      sessionStorage.setItem("refreshToken", result.refresh);

      message.success("Login successful!");

      // Redirect user to the chat page
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
            <Flex vertical gap="small">
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Username"
                      size="large"
                    />
                  )}
                />
                {errors.username && (
                  <Text
                    type="danger"
                    style={{ fontSize: "14px", marginTop: "4px" }}
                  >
                    {errors.username.message}
                  </Text>
                )}
              </Form.Item>
            </Flex>

            <Flex vertical gap="small">
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="Password"
                      size="large"
                    />
                  )}
                />
                {errors.password && (
                  <Text
                    type="danger"
                    style={{ fontSize: "14px", marginTop: "4px" }}
                  >
                    {errors.password.message}
                  </Text>
                )}
              </Form.Item>
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
