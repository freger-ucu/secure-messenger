import { useState, useEffect } from "react";
import { Flex, message, Button, FloatButton, Modal, Input, Form, theme, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";
import { useContacts } from "./hooks/useContacts";
import { useChatMessages } from "./hooks/useChatMessages";
import { useWebSocket } from "./hooks/useWebSocket";
import { useChatKey } from "./hooks/useChatKey";
import { useAddChat } from "./hooks/useAddChat";
import { useAuthToken } from "./hooks/useAuthToken";
import { withAuthProtection } from "../auth/withAuthProtection";
import { encryptMessageAES } from "../../utilities/crypto";

function Chat() {
  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);

  // State management
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addChatForm] = Form.useForm();
  const { token } = theme.useToken();

  // Auth hook to handle token refresh
  const { accessToken, tokenError } = useAuthToken();

  // Custom hooks
  const { symKey } = useChatKey(selectedContactId);
  const {
    contacts,
    setContacts,
    loading: contactsLoading,
    error: contactsError,
  } = useContacts(selectedContactId, setSelectedContactId);
  const {
    loading: messagesLoading,
    error: messagesError,
    fetchChatMessages,
  } = useChatMessages(contacts, setContacts, selectedContactId, symKey);
  const { addingChat, createNewChat } = useAddChat(
    setContacts,
    setSelectedContactId
  );

  // WebSocket connection for real-time messaging
  const { sendMessage } = useWebSocket(
    selectedContactId,
    contacts,
    setContacts,
    symKey
  );

  const [isChangingChat, setIsChangingChat] = useState(false);

  // UI interaction handlers
  const handleSelectContact = (contactId) => {
    setIsChangingChat(true);
    setSelectedContactId(contactId);
    if (isMobile) {
      setSidebarVisible(false);
    }

    setContacts((prevContacts) =>
      prevContacts.map((contact) => {
        if (
          contact.id === contactId &&
          contact.lastMessage &&
          !contact.lastMessage.isRead
        ) {
          return {
            ...contact,
            lastMessage: {
              ...contact.lastMessage,
              isRead: true,
            },
          };
        }
        return contact;
      })
    );

    // Add a timeout to simulate loading
    setTimeout(() => {
      setIsChangingChat(false);
    }, 500);
  };

  const handleAddChatModal = {
    open: () => setModalVisible(true),
    close: () => {
      setModalVisible(false);
      addChatForm.resetFields();
    },
    submit: async (values) => {
      try {
        await createNewChat(values, addChatForm, setModalVisible);
      } catch (error) {
        // Map error codes to user-friendly messages
        const errorMessage = {
          "USER_NOT_FOUND": "The username you entered does not exist.",
          "CHAT_ALREADY_EXISTS": "A chat with this user already exists.",
          "INVALID_USERNAME": "The username is invalid. Please try again.",
          "UNKNOWN_ERROR": "An unknown error occurred. Please try again later.",
        }[error.code] || "An unexpected error occurred. Please try again.";

        message.error(errorMessage);
      }
    },
  };

  const handleSendMessage = (text) => {
    if (!text.trim() || !selectedContactId) return;

    const currentUsername = sessionStorage.getItem("username");

    // Temporary optimistic UI update
    const newMessage = {
      id: Date.now(),
      text: text,
      sender: currentUsername,
      timestamp: new Date(),
      isFromCurrentUser: true,
    };

    // Update UI with new message
    setContacts((prevContacts) =>
      prevContacts.map((contact) => {
        if (contact.id === selectedContactId) {
          return {
            ...contact,
            messages: [...(contact.messages || []), newMessage],
            lastMessage: {
              text: text,
              timestamp: new Date(),
              isRead: true,
            },
          };
        }
        return contact;
      })
    );

    // Encrypt the message with AES-GCM symmetric key and send
    (async () => {
      if (!symKey) {
        message.error("Encryption not ready. Retry shortly.");
        return;
      }
      try {
        const { ct, iv } = await encryptMessageAES(text, symKey);
        sendMessage(JSON.stringify({ ct, iv }));
      } catch (err) {
        console.error("AES encryption error:", err);
      }
    })();
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const handleBackToList = () => {
    if (isMobile) {
      setSidebarVisible(true);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarVisible) {
        setSidebarVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarVisible]);

  // Ensure the chat list is shown on mobile when the user logs in
  useEffect(() => {
    if (isMobile) {
      setSelectedContactId(null);
      setSidebarVisible(true);
    }
  }, [isMobile]);

// Fetch chat history when symmetric key is available
useEffect(() => {
  if (selectedContactId && symKey) {
    fetchChatMessages(selectedContactId);
  }
  const intervalId = setInterval(() => {
    if (selectedContactId && symKey) {
      fetchChatMessages(selectedContactId);
    }
  }, 5000);
  return () => clearInterval(intervalId);
}, [selectedContactId, symKey, fetchChatMessages]);

  // Handle token errors
  useEffect(() => {
    if (tokenError) {
      message.error("Authentication error. Please log in again.");
    }
  }, [tokenError]);

  // UI rendering
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;
  const navbarHeight = isMobile ? "56px" : "64px";
  const loading = contactsLoading;
  const error = contactsError || messagesError || tokenError;

  // Add Chat Modal
  const renderAddChatModal = () => (
    <Modal
      title="Create New Chat"
      open={modalVisible}
      onCancel={handleAddChatModal.close}
      footer={null}
    >
      <Form
        form={addChatForm}
        layout="vertical"
        onFinish={handleAddChatModal.submit}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: "Please enter a username" },
            { min: 3, message: "Username must be at least 3 characters" },
          ]}
        >
          <Input placeholder="Enter username to chat with" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={addingChat}
            block
          >
            Create Chat
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  // The Add Chat floating button - now it's outside of conditional rendering blocks
  const renderFloatingButton = () => {
    if (!isMobile) return null; // Only show the button on mobile
    if (!sidebarVisible) return null; // Only show the button when the chat list is visible
    return (
      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddChatModal.open}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: token.colorBgContainerDisabled,
        }}
      >
        <p>Loading messages...</p>
        {renderFloatingButton()}
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: token.colorErrorBg,
          padding: "0 24px",
        }}
      >
        <p type="danger" style={{ marginBottom: 16 }}>
          Error loading messages: {error.message}
        </p>
        <Button
          onClick={() =>
            selectedContactId && fetchChatMessages(selectedContactId)
          }
        >
          Retry
        </Button>
        {renderFloatingButton()}
      </Flex>
    );
  }

  // Mobile view with drawer
  if (isMobile) {
    return (
      <Flex
        vertical
        style={{ height: "100vh", width: "100%", overflow: "hidden" }}
      >
        <ChatNavigation toggleSidebar={toggleSidebar} isMobile={isMobile} />

        <Flex
          style={{
            flex: 1,
            marginTop: navbarHeight,
            overflow: "hidden",
          }}
        >
          {sidebarVisible ? (
            <Flex
              vertical
              style={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                position: "relative"
              }}
            >
              <Flex
                vertical
                style={{
                  height: "100%"
                }}
              >
                <ChatList
                  contacts={contacts}
                  selectedContactId={selectedContactId}
                  onSelectContact={handleSelectContact}
                  loading={loading}
                  isMobile={isMobile}
                />
              </Flex>
            </Flex>
          ) : (
            <Flex
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <ChatInterface
                contact={selectedContact}
                messages={selectedContact?.messages || []}
                onSendMessage={handleSendMessage}
                loading={messagesLoading}
                error={messagesError}
                isMobile={isMobile}
                onBack={handleBackToList}
              />
            </Flex>
          )}
        </Flex>

        {/* Always render the floating button, regardless of sidebar state */}
        {renderFloatingButton()}
        {renderAddChatModal()}
      </Flex>
    );
  }

  // Desktop view
  return (
    <Flex
      vertical
      style={{ height: "100vh", width: "100%", overflow: "hidden" }}
    >
      <ChatNavigation toggleSidebar={toggleSidebar} isMobile={isMobile} />
      <Flex
        style={{
          flex: 1,
          marginTop: navbarHeight,
          overflow: "hidden",
        }}
      >
        {/* Chat List Section */}
        <Flex
          vertical
          style={{
            width: "33%",
            borderRight: `1px solid ${token.colorBorder}`,
            overflow: "auto",
            display: sidebarVisible ? "flex" : "none",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${token.colorBorder}`,
            }}
          >
            <h3 style={{ margin: 0 }}>Chats</h3>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddChatModal.open}
            >
              Add Chat
            </Button>
          </Flex>
          <ChatList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
            loading={loading}
            isMobile={isMobile}
          />
        </Flex>

        {/* Chat Interface Section */}
        <Flex
          style={{
            flex: 1,
            width: sidebarVisible ? "67%" : "100%",
            overflow: "hidden",
          }}
        >
          {selectedContact ? (
            isChangingChat ? (
              <Flex 
                vertical 
                style={{ 
                  width: "100%", 
                  height: "100%",
                  padding: token.padding,
                  backgroundColor: token.colorBgContainer 
                }}
              >
                <Skeleton.Input
                  active
                  size="large"
                  block
                  style={{ marginBottom: token.margin }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "20%", marginBottom: token.marginLG }}
                />
                <Skeleton
                  active
                  paragraph={{ rows: 6, width: ['60%', '80%', '40%', '70%', '50%', '90%'] }}
                />
              </Flex>
            ) : (
              <ChatInterface
                contact={selectedContact}
                messages={selectedContact.messages || []}
                onSendMessage={handleSendMessage}
                loading={messagesLoading}
                error={messagesError}
                isMobile={isMobile}
                onBack={handleBackToList}
              />
            )
          ) : (
            <Flex justify="center" align="center" style={{ width: "100%" }}>
              {loading
                ? "Loading chats..."
                : "Select a chat to start messaging"}
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Always render the floating button for desktop too */}
      {renderFloatingButton()}
      {renderAddChatModal()}
    </Flex>
  );
}

export default withAuthProtection(Chat);