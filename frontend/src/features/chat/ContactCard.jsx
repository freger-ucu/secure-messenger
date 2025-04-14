import React from "react";
import { Flex, Typography, Avatar, Badge } from "antd";
import { formatDistanceToNow } from "date-fns";

const ContactCard = ({
  contact = {
    id: "",
    name: "",
    avatar: "",
    lastMessage: {
      text: "",
      timestamp: new Date(),
      isRead: true,
    },
    isOnline: false,
  },
  isSelected = false,
  onSelect = () => {},
}) => {
  // Safely access contact.lastMessage.timestamp
  const lastMessage = contact.lastMessage || {};
  const formattedTime = lastMessage.timestamp
    ? formatDistanceToNow(new Date(lastMessage.timestamp), {
        addSuffix: true,
        includeSeconds: true,
      })
    : ""; // Default to empty string if timestamp is unavailable

  // Determine if the last message was from the contact (not from the user)
  const isLastMessageFromContact =
    contact.messages &&
    contact.messages.length > 0 &&
    contact.messages[contact.messages.length - 1].sender === "contact";

  // Only show unread indicator if the message is from contact and not read
  const showUnreadIndicator = isLastMessageFromContact && !lastMessage.isRead;

  return (
    <Flex
      align="center"
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        width: "100%",
        backgroundColor: isSelected ? "#e6f7ff" : "white",
        marginBottom: "8px",
        border: "1px solid #f0f0f0",
      }}
      onClick={() => onSelect(contact.id)}
    >
      {/* Avatar with online status indicator */}
      <Badge
        dot
        color={contact.isOnline ? "#52c41a" : "#d9d9d9"}
        offset={[-4, 32]}
      >
        <Avatar size={40} src={contact.avatar} style={{ flexShrink: 0 }}>
          {!contact.avatar && contact.name.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>

      {/* Contact details */}
      <Flex
        vertical
        style={{
          marginLeft: 12,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Flex justify="space-between" align="center">
          <Typography.Text
            strong={showUnreadIndicator}
            style={{
              fontSize: 16,
              color: showUnreadIndicator ? "#1890ff" : undefined,
            }}
          >
            {contact.name}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formattedTime}
          </Typography.Text>
        </Flex>

        <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
          <Typography.Text
            type={showUnreadIndicator ? "primary" : "secondary"}
            ellipsis={{}}
            style={{
              maxWidth: "80%",
              fontSize: 14,
              fontWeight: showUnreadIndicator ? "bold" : "normal",
            }}
          >
            {lastMessage.text}
          </Typography.Text>

          {showUnreadIndicator && (
            <Badge count={1} size="small" style={{ marginLeft: "auto" }} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ContactCard;
