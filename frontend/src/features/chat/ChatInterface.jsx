import React, { useState, useRef, useEffect } from "react";
import { Flex, Input, Button, Typography, Avatar } from "antd";
import { SendOutlined } from "@ant-design/icons";

const ChatInterface = ({
  contact = {
    id: "",
    name: "",
    avatar: "",
    isOnline: false,
  },
  messages = [],
  onSendMessage = () => {},
  currentUserAvatar = "https://i.pravatar.cc/150?img=8",
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages change or contact changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, contact.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    onSendMessage(newMessage);
    setNewMessage("");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!contact.id) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{ width: "100%", height: "100%" }}
      >
        <Typography.Text type="secondary">
          Select a conversation to start chatting
        </Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* Chat header */}
      <Flex
        align="center"
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "white",
          width: "100%",
        }}
      >
        <Avatar src={contact.avatar} size={40}>
          {!contact.avatar && contact.name.charAt(0).toUpperCase()}
        </Avatar>
        <Flex vertical style={{ margin: "0 0 0 12px" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {contact.name}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            {contact.isOnline ? "Online" : "Offline"}
          </Typography.Text>
        </Flex>
      </Flex>

      {/* Messages container */}
      <Flex
        vertical
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px",
          width: "100%",
        }}
      >
        {messages.map((msg) => (
          <Flex
            key={msg.id}
            style={{
              marginBottom: "16px",
              width: "100%",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.sender === "contact" && (
              <Avatar
                src={contact.avatar}
                size={32}
                style={{ marginRight: "8px", alignSelf: "flex-end" }}
              >
                {!contact.avatar && contact.name.charAt(0).toUpperCase()}
              </Avatar>
            )}

            <Flex
              vertical
              style={{
                maxWidth: "70%",
                backgroundColor: msg.sender === "user" ? "#1890ff" : "white",
                color: msg.sender === "user" ? "white" : "rgba(0, 0, 0, 0.85)",
                borderRadius: "12px",
                padding: "10px 16px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography.Text
                style={{
                  color:
                    msg.sender === "user" ? "white" : "rgba(0, 0, 0, 0.85)",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  marginTop: "4px",
                  textAlign: msg.sender === "user" ? "right" : "left",
                  color:
                    msg.sender === "user"
                      ? "rgba(255, 255, 255, 0.75)"
                      : "rgba(0, 0, 0, 0.45)",
                }}
              >
                {formatTime(msg.timestamp)}
              </Typography.Text>
            </Flex>

            {msg.sender === "user" && (
              <Avatar
                src={currentUserAvatar}
                size={32}
                style={{ marginLeft: "8px", alignSelf: "flex-end" }}
              />
            )}
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </Flex>

      {/* Message input */}
      <Flex
        style={{
          backgroundColor: "white",
          padding: "12px 16px",
          borderTop: "1px solid #f0f0f0",
          width: "100%",
        }}
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="Type a message..."
          size="large"
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          style={{ marginLeft: "8px" }}
        />
      </Flex>
    </Flex>
  );
};

export default ChatInterface;
