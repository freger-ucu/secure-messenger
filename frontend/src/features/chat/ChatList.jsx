import { useState } from "react";
import { Flex, Button, Input } from "antd";
import ContactCard from "./ContactCard";
import AddNewChatModal from "../add-new-chat/AddNewChatModal";

const ChatList = ({
  contacts = [],
  selectedContactId,
  onSelectContact = () => {},
}) => {
  const { Search } = Input;
  const [searchText, setSearchText] = useState("");

  // Filter contacts based on search text
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.lastMessage.text.toLowerCase().includes(searchText.toLowerCase())
  );

  // add new chats
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);

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

      <Button type="primary" block onClick={showModal}>
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

      {/* Add new chat modal */}
      <AddNewChatModal isOpen={isModalOpen} onOk={handleOk} onCancel={handleCancel} />
    </Flex>
  );
};

export default ChatList;
