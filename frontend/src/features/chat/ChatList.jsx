import { Flex, Button, Input } from "antd";
import ContactCard from "./ContactCard";

const ChatList = () => {
  const { Search } = Input;

  return (
    <Flex
      vertical
      gap={"small"}
      style={{
        width: "100%",
        height: "100%", // Ensures it stretches fully
        padding: "24px",
      }}
    >
      {/* Search Bar */}
      <Search placeholder="Search chats..." size="large" />

      {/* Scrollable Contact List */}
      <Flex
        vertical
        style={{
          flex: 1, // Fills available space
          overflowY: "auto", // Enables scrolling if too many contacts
        }}
      >
        <ContactCard
          name="Antony"
          lastMessage="got the package?"
          time="15:22"
          status="read"
        />
        <ContactCard
          name="Elena"
          lastMessage="See you later!"
          time="14:05"
          status="unread"
        />
        <ContactCard
          name="Michael"
          lastMessage="Meeting at 5?"
          time="13:48"
          status="pending"
        />
        <ContactCard
          name="Sophie"
          lastMessage="Good night!"
          time="00:15"
          status="read"
        />
      </Flex>

      {/* Button stays at the bottom */}
      <Button type="primary" block>
        Add New Chat
      </Button>
    </Flex>
  );
};

export default ChatList;
