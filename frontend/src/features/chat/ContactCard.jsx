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
  // Format the timestamp to relative time (e.g., "5 min ago")
  const formattedTime = formatDistanceToNow(
    new Date(contact.lastMessage.timestamp),
    {
      addSuffix: true,
      includeSeconds: true,
    }
  );

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
          <Typography.Text strong style={{ fontSize: 16 }}>
            {contact.name}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formattedTime}
          </Typography.Text>
        </Flex>

        <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
          <Typography.Text
            type="secondary"
            ellipsis={{ tooltip: contact.lastMessage.text }}
            style={{
              maxWidth: "80%",
              fontSize: 14,
              fontWeight: contact.lastMessage.isRead ? "normal" : "bold",
            }}
          >
            {contact.lastMessage.text}
          </Typography.Text>

          {!contact.lastMessage.isRead && (
            <Badge count={1} size="small" style={{ marginLeft: "auto" }} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ContactCard;
