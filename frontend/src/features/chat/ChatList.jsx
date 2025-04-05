import { Flex, Button, Input } from "antd";

const ChatList = () => {
  // The correct way to access Search in Antd
  const { Search } = Input;

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
    </Flex>
  );
};

export default ChatList;
