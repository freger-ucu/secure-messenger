import { Flex, Button, Typography, Avatar } from "antd";
import UserModal from "../user-management/UserModal";
import { useState } from "react";

export default function ChatNavigation() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "16px 24px",
          borderBottom: "1px solid #ddd",
          background: "#fff",
          zIndex: 1000,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Chat
        </Typography.Title>
        <Avatar size={40} style={{ flexShrink: 0 }} onClick={showModal}>
          User
        </Avatar>
      </Flex>

      {/* 💣 This is where the magic happens */}
      <UserModal isOpen={isModalOpen} onOk={handleOk} onCancel={handleCancel} />
    </>
  );
}
