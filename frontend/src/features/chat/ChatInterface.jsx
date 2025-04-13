import { useState, useRef, useEffect } from "react";
import { Input, Button, List, Avatar, Typography, Badge, Flex } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function ChatInterface({ contact, messages, onSendMessage }) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const currentUsername = sessionStorage.getItem("username");

  // Format timestamp for display
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a message
  const handleSend = () => {
    if (messageText.trim() && contact) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  // Handle pressing Enter to send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If no contact is selected, display a placeholder
  if (!contact) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Text type="secondary">Select a conversation to start chatting</Text>
      </Flex>
    );
  }

  // Filter out duplicate messages that might be causing the echo
  const uniqueMessages = messages.reduce((acc, current) => {
    const duplicate = acc.find(
      (item) =>
        item.id === current.id ||
        (item.text === current.text &&
          Math.abs(new Date(item.timestamp) - new Date(current.timestamp)) <
            1000)
    );
    if (!duplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Chat header */}
      <Flex
        align="center"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fff",
        }}
      >
        <Avatar
          size={40}
          style={{ marginRight: 12 }}
          // Use a fallback if avatar is not available
          src={contact.avatar}
        >
          {contact.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Flex vertical style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 16 }}>
            {contact.name}
          </Text>
          <Flex align="center">
            <Badge
              status={contact.isOnline ? "success" : "default"}
              style={{ marginRight: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {contact.isOnline ? "Online" : "Offline"}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Messages area */}
      <Flex
        vertical
        style={{
          flex: 1,
          padding: "16px 24px",
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={uniqueMessages}
          renderItem={(msg) => {
            // Check if the message is from the current user
            // This is the key change - properly determine if message is from current user
            const isCurrentUser = msg.sender === currentUsername;

            return (
              <List.Item
                style={{
                  padding: "8px 0",
                  display: "flex",
                  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                }}
              >
                {/* Show avatar for other users if available */}
                {!isCurrentUser && (
                  <Avatar
                    size={32}
                    style={{ marginRight: 8, alignSelf: "flex-end" }}
                  >
                    {msg.sender?.charAt(0).toUpperCase()}
                  </Avatar>
                )}

                <Flex
                  vertical
                  style={{
                    maxWidth: "70%",
                  }}
                >
                  {/* Sender name for messages not from current user */}
                  {!isCurrentUser && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, marginBottom: 4 }}
                    >
                      {msg.sender}
                    </Text>
                  )}

                  <div
                    style={{
                      padding: "10px 16px",
                      borderRadius: isCurrentUser
                        ? "18px 18px 0 18px"
                        : "18px 18px 18px 0",
                      backgroundColor: isCurrentUser ? "#1890ff" : "#fff",
                      color: isCurrentUser ? "#fff" : "#000",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {msg.text}
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      textAlign: isCurrentUser ? "right" : "left",
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </Flex>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </Flex>

      {/* Message input area */}
      <Flex
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #f0f0f0",
          backgroundColor: "#fff",
        }}
      >
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, marginRight: 16 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!messageText.trim()}
        />
      </Flex>
    </Flex>
  );
}
