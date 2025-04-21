import { clearTokens } from "../../utilities/auth";
import { useNavigate } from "react-router";
import { Flex, Button, Typography, theme } from "antd";
import { MenuOutlined } from "@ant-design/icons";

export default function ChatNavigation({ toggleSidebar, isMobile }) {
  const navigate = useNavigate();
  const { token } = theme.useToken();

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
        padding: isMobile ? "12px 16px" : "16px 24px",
        borderBottom: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
        zIndex: 1000,
      }}
    >
      <Flex align="center" gap={12}>
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          Chat
        </Typography.Title>
      </Flex>
      <Button 
        type="dashed" 
        danger 
        onClick={handleLogout}
        size={isMobile ? "small" : "middle"}
      >
        Log Out
      </Button>
    </Flex>
  );
}