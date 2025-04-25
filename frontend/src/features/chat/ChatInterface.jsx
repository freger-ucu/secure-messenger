import { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Badge,
  Flex,
  theme,
} from "antd";
import { SendOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function ChatInterface({
  contact,
  messages,
  onSendMessage,
  isMobile,
  onBack,
}) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const currentUsername = sessionStorage.getItem("username");
  const { token } = theme.useToken();

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim() && contact) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!contact) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: token.colorBgContainer,
        }}
      >
        <Text type="secondary">
          {isMobile
            ? "Tap a chat to start messaging"
            : "Select a conversation to start chatting"}
        </Text>
      </Flex>
    );
  }

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
        overflow: "hidden",
        backgroundColor: token.colorBgLayout,
      }}
    >
      {/* Header */}
      <Flex
        align="center"
        style={{
          padding: isMobile ? "8px 12px" : token.padding,
          borderBottom: `1px solid ${token.colorBorder}`,
          backgroundColor: token.colorBgContainer,
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginRight: 8 }}
            aria-label="Back to chats"
          />
        )}
        <Avatar
          size={isMobile ? 32 : 40}
          style={{ marginRight: token.margin }}
          src={contact.avatar}
        >
          {contact.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Flex vertical style={{ flex: 1 }}>
          <Text
            strong
            style={{ fontSize: isMobile ? token.fontSize : token.fontSizeLG }}
          >
            {contact.name}
          </Text>
          <Flex align="center">
            <Badge
              status={contact.isOnline ? "success" : "default"}
              style={{ marginRight: token.marginXXS }}
            />
          </Flex>
        </Flex>
      </Flex>

      {/* Messages */}
      <Flex
        vertical
        style={{
          flex: 1,
          padding: isMobile ? "8px" : token.padding,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: token.colorBgContainer,
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={uniqueMessages}
          style={{ width: "100%" }}
          renderItem={(msg) => {
            const isCurrentUser = msg.sender === currentUsername;
            return (
              <List.Item
                style={{
                  padding: `${token.paddingXXS} 0`,
                  display: "flex",
                  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                  borderBottom: "none",
                }}
              >
                {!isCurrentUser && (
                  <Avatar
                    size={isMobile ? 24 : 32}
                    style={{ marginRight: token.marginXXS }}
                  >
                    {msg.sender?.charAt(0).toUpperCase()}
                  </Avatar>
                )}

                <Flex vertical style={{ maxWidth: isMobile ? "80%" : "70%" }}>
                  {!isCurrentUser && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: isMobile ? "10px" : token.fontSizeSM,
                        marginBottom: token.marginXXS,
                      }}
                    >
                      {msg.sender}
                    </Text>
                  )}

                  <div
                    style={{
                      padding: isMobile
                        ? `${token.paddingXXS}px ${token.paddingXS}px`
                        : `${token.paddingXS}px ${token.padding}px`,
                      borderRadius: isCurrentUser
                        ? "18px 18px 0 18px"
                        : "18px 18px 18px 0",
                      backgroundColor: isCurrentUser
                        ? token.colorPrimary
                        : token.colorBgBase,
                      color: isCurrentUser ? token.colorWhite : token.colorText,
                      boxShadow: token.boxShadowTertiary,
                      fontSize: isMobile ? "14px" : "inherit",
                    }}
                  >
                    {msg.text}
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: isMobile ? "10px" : token.fontSizeXS,
                      marginTop: token.marginXXS,
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

      {/* Input */}
      <Flex
        style={{
          padding: isMobile ? "8px" : token.padding,
          borderTop: `1px solid ${token.colorBorder}`,
          backgroundColor: token.colorBgContainer,
        }}
      >
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, marginRight: token.margin }}
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
