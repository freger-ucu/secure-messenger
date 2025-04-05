import { Flex } from "antd";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

export default function Chat() {
  // Calculate navbar height to match what's in ChatNavigation
  const navbarHeight = "64px"; // Estimate based on padding and content

  return (
    <Flex vertical style={{ height: "100vh", width: "100%" }}>
      <ChatNavigation />
      <Flex
        style={{
          flex: 1,
          overflow: "hidden",
          marginTop: navbarHeight, // Add margin to account for fixed navbar
        }}
      >
        <Flex
          style={{
            borderRight: "1px solid #f0f0f0",
            overflow: "auto",
            paddingTop: "24px", // Add padding to account for navbar
          }}
        >
          <ChatList />
        </Flex>
        <Flex
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
        >
          <ChatInterface />
        </Flex>
      </Flex>
    </Flex>
  );
}
