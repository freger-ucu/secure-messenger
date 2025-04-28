import { clearTokens } from "../../utilities/auth";
import { useNavigate } from "react-router";
import { Flex, Button, Typography, theme, Avatar } from "antd";
import { useEffect, useState } from "react";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

export default function ChatNavigation({ toggleSidebar, isMobile }) {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0, color: token.colorText }}>
          Chat
        </Typography.Title>
      </Flex>
      <Flex align="center" gap={16}>
        <Flex align="center" gap={2}>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: token.colorBgContainer,
              verticalAlign: 'middle' 
            }}
            size={isMobile ? "small" : "default"}
          />
          <Typography.Text 
            style={{ 
              fontSize: isMobile ? "12px" : "14px",
              color: token.colorText,
              fontWeight: "500"
            }}
          >
            {username}
          </Typography.Text>
        </Flex>
        <Button 
          type="primary" 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          size={isMobile ? "small" : "middle"}
          danger
        >
          {!isMobile && "Logout"}
        </Button>
      </Flex>
    </Flex>
  );
}