import { useState } from "react";
import { Flex, Button, Input } from "antd";
import ContactCard from "./ContactCard";

const ChatList = () => {
  // The correct way to access Search in Antd
  const { Search } = Input;
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Sample contacts data
  const contacts = [
    {
      id: "1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
      lastMessage: {
        text: "Hey, are we still meeting tomorrow?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: false,
      },
      isOnline: true,
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=5",
      lastMessage: {
        text: "The project files have been uploaded to the shared folder",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isRead: true,
      },
      isOnline: false,
    },
    {
      id: "3",
      name: "Team Group",
      avatar: "",
      lastMessage: {
        text: "Alice: Let's discuss this at the meeting",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
      },
      isOnline: false,
    },
  ];

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    // Here you would also update the parent component or use a state manager
    // to show the selected conversation in the chat interface
  };

  return (
    <Flex
      align="start"
      vertical
      gap="small"
      style={{
        width: "100%",
        padding: "0 24px",
        height: "100%", // Ensure it takes full height
      }}
    >
      <Search placeholder="Search chats..." size="large" />

      <Button type="primary" block>
        Add New Chat
      </Button>

      {/* Contact cards section */}
      <Flex
        vertical
        style={{
          width: "100%",
          marginTop: "16px",
          overflow: "auto",
          flex: 1,
        }}
      >
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={selectedContactId === contact.id}
            onSelect={handleSelectContact}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default ChatList;
