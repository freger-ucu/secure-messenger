import { Flex } from "antd";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

const NAVBAR_HEIGHT = 60;

export default function Chat() {
  return (
    <Flex
      style={{
        position: "absolute",
        top: NAVBAR_HEIGHT,
        left: 0,
        width: "100vw",
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        overflow: "hidden",
      }}
    >
      <ChatNavigation style={{ width: "20%", height: "100%" }} />
      <Flex style={{ flex: 1, height: "100%" }}>
        {/* Chat List */}
        <Flex
          style={{
            width: "20%",
            height: "100%",
            backgroundColor: "#f5f5f5",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <ChatList />
        </Flex>

        {/* Chat Interface */}
        <Flex
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0, // Ensures flex doesn't break the layout
          }}
        >
          <ChatInterface />
        </Flex>
      </Flex>
    </Flex>
  );
}
