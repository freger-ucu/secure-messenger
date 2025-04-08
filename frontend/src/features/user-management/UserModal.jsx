import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Typography,
  Space,
  message,
} from "antd";
import { UploadOutlined, LogoutOutlined } from "@ant-design/icons";
import { useState } from "react";

import { useNavigate } from "react-router";
import { clearTokens } from "../../utilities/auth";

export default function UserModal({ isOpen, onOk, onCancel }) {
  const [form] = Form.useForm();
  const [userId] = useState("user-123456789");
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  const handleUpload = (info) => {
    if (info.file.status === "done" || info.file.status === "uploading") {
      // Fake it for now
      setProfilePic(URL.createObjectURL(info.file.originFileObj));
      message.success("Profile picture uploaded!");
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log("Updated user info:", values);
      onOk(); // Close modal after save
    });
  };

  return (
    <Modal
      title="User Management"
      open={isOpen}
      onCancel={onCancel}
      footer={[
        <Button
          key="logout"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Log Out
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{ username: "YourName" }}
      >
        <Form.Item label="Profile Picture">
          <Space direction="horizontal">
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUpload}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
            {profilePic && (
              <img
                src={profilePic}
                alt="Profile"
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            )}
          </Space>
        </Form.Item>

        <Form.Item
          label="User Name"
          name="username"
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

        <Form.Item label="User ID">
          <Space>
            <Typography.Text type="secondary" copyable={{ text: userId }}>
              {userId}
            </Typography.Text>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
