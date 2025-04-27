import { List, Badge, Spin, theme, Avatar, Flex } from "antd";

export default function ChatList({
  contacts,
  selectedContactId,
  onSelectContact,
  loading,
  isMobile,
}) {
  const { token } = theme.useToken();

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", width: "100%" }}>
        <Spin tip="Loading chats..." />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", width: "100%" }}>
        No chats available
      </div>
    );
  }

  return (
    <List
      style={{ width: "100%" }}
      itemLayout="horizontal"
      dataSource={contacts.slice().sort((a, b) => {
        const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return bTime - aTime;
      })}
      renderItem={(contact) => (
        <List.Item
          onClick={() => onSelectContact(contact.id)}
          style={{
            padding: isMobile ? "8px 16px" : "12px 24px",
            cursor: "pointer",
            backgroundColor:
              contact.id === selectedContactId
                ? token.colorBgElevated
                : "transparent",
          }}
        >
          {isMobile ? (
            <Flex align="center" style={{ width: "100%" }}>
              <Avatar size={32} style={{ marginRight: 12 }}>
                {contact.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Flex vertical style={{ flex: 1, overflow: "hidden" }}>
                <Flex justify="space-between" align="center">
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {contact.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {contact.lastMessage?.timestamp
                      ? new Date(
                          contact.lastMessage.timestamp
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </Flex>
                <Flex justify="space-between" align="center">
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "85%",
                    }}
                  >
                    {contact.lastMessage?.text
                      ? contact.lastMessage.text
                      : "No messages yet"}
                  </span>
                  {contact.lastMessage && !contact.lastMessage.isRead && (
                    <Badge count={1} size="small" />
                  )}
                </Flex>
              </Flex>
            </Flex>
          ) : (
            <List.Item.Meta
              avatar={
                <Avatar size={40}>
                  {contact.name?.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{contact.name}</span>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {contact.lastMessage?.timestamp
                      ? new Date(
                          contact.lastMessage.timestamp
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              }
              description={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      maxWidth: "85%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {contact.lastMessage?.text
                      ? contact.lastMessage.text.length > 30
                        ? contact.lastMessage.text.substring(0, 30) + "..."
                        : contact.lastMessage.text
                      : "No messages yet"}
                  </span>
                  {contact.lastMessage && !contact.lastMessage.isRead && (
                    <Badge count={1} style={{ marginLeft: "8px" }} />
                  )}
                </div>
              }
            />
          )}
        </List.Item>
      )}
    />
  );
}
