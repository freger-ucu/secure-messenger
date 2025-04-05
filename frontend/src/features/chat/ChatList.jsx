import React, { useState } from "react";
import { Flex, Button, Input } from "antd";
import ContactCard from "./ContactCard";

const ChatList = ({
  contacts = [],
  selectedContactId,
  onSelectContact = () => {},
}) => {
  // The correct way to access Search in Antd
  const { Search } = Input;
  const [searchText, setSearchText] = useState("");

  // Filter contacts based on search text
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.lastMessage.text.toLowerCase().includes(searchText.toLowerCase())
  );

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
      <Search
        placeholder="Search chats..."
        size="large"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

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
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={selectedContactId === contact.id}
            onSelect={onSelectContact}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default ChatList;
