import { List, Badge, Spin } from "antd";

export default function ChatList({
  contacts,
  selectedContactId,
  onSelectContact,
  loading,
}) {
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
      dataSource={contacts}
      renderItem={(contact) => (
        <List.Item
          onClick={() => onSelectContact(contact.id)}
          style={{
            padding: "12px 24px",
            cursor: "pointer",
            backgroundColor:
              contact.id === selectedContactId ? "#f0f0f0" : "transparent",
          }}
        >
          <List.Item.Meta
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
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
        </List.Item>
      )}
    />
  );
}
