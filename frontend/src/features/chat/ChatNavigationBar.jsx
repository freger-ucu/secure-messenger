import { clearTokens } from "../../utilities/auth";
import { useNavigate } from "react-router";
import { Flex, Button, Typography } from "antd";

export default function ChatNavigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "16px 24px",
        borderBottom: "1px solid #ddd",
        background: "#fff",
        zIndex: 1000,
      }}
    >
      <Typography.Title level={3} style={{ margin: 0 }}>
        Chat
      </Typography.Title>
      <Button type="dashed" danger onClick={handleLogout}>
        Log Out
      </Button>
    </Flex>
  );
}
