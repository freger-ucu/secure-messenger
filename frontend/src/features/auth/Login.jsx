// src/pages/LoginPage.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { Form, Input, Button, Alert, Typography } from "antd";

const { Title } = Typography;

// Validation Schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Placeholder for API call
      console.log("Logging in with:", data);
      // Simulate API delay
      await new Promise((res) => setTimeout(res, 1000));

      // TODO: Implement real authentication logic
      alert("Login Successful!");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <Title level={2} className="text-center">Login</Title>
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <Form.Item label="Email" validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
            <Input {...register("email")} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item label="Password" validateStatus={errors.password ? "error" : ""} help={errors.password?.message}>
            <Input.Password {...register("password")} placeholder="Enter your password" />
          </Form.Item>

          {error && <Alert message={error} type="error" showIcon className="mb-4" />}

          <Button type="primary" htmlType="submit" block loading={loading} className="mt-2">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
``