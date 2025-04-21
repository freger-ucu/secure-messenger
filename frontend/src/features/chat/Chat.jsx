import { useState, useEffect, useRef } from "react";
import { Flex, message, Button, Modal, Input, Form, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

export default function Chat() {
  // State management
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addChatForm] = Form.useForm();
  const [addingChat, setAddingChat] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageLoadError, setMessageLoadError] = useState(null);
  const [error, setError] = useState(null);

  const { token } = theme.useToken();
 
  // References and constants
  const wsRef = useRef(null);
  const accessToken = sessionStorage.getItem("accessToken");
  const currentUsername = sessionStorage.getItem("username");
  const API_BASE_URL = "http://127.0.0.1:8000/api";
  const WS_BASE_URL = "ws://127.0.0.1:8000/ws";
  const REFRESH_INTERVAL = 5000; // 5 seconds
  const MAX_RETRY_COUNT = 3;

  // Authentication check
  if (!currentUsername || !accessToken) {
    console.error("No username or access token found!");
    // Could implement redirect logic here
  }

  // API request helpers
  const fetchWithAuth = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  };

  // Chat data management
  const fetchContacts = async () => {
    if (!accessToken) return;

    try {
      const data = await fetchWithAuth("/chat/");

      if (data.status === "success" && Array.isArray(data.chats)) {
        const formattedContacts = data.chats.map((chat) => ({
          id: chat.id,
          name: chat.other_user || "Unknown User",
          lastMessage:
            chat.latest_message?.length > 0
              ? {
                  text: chat.latest_message[0].body,
                  timestamp: new Date(chat.latest_message[0].timestamp),
                  isRead: true,
                }
              : null,
        }));

        // Update contacts while preserving messages for existing chats
        setContacts((prevContacts) => {
          const existingContactsMap = {};
          prevContacts.forEach((contact) => {
            existingContactsMap[contact.id] = contact.messages || [];
          });

          return formattedContacts.map((newContact) => ({
            ...newContact,
            messages: existingContactsMap[newContact.id] || [],
          }));
        });

        // Select first contact if none selected
        if (formattedContacts.length > 0 && !selectedContactId) {
          setSelectedContactId(formattedContacts[0].id);
        }
      }
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  };

  const fetchChatMessages = async (chatId, retryCount = 0) => {
    if (!accessToken || !chatId) return;

    setMessagesLoading(true);
    setMessageLoadError(null);

    try {
      const data = await fetchWithAuth(`/chat/${chatId}/history/`);

      if (data.status === "success" && Array.isArray(data.messages)) {
        console.log(
          `Loaded ${data.messages.length} messages for chat #${chatId}`
        );

        setContacts((prevContacts) =>
          prevContacts.map((contact) => {
            if (contact.id === chatId) {
              return {
                ...contact,
                messages: data.messages.map((msg) => ({
                  id: msg.id,
                  text: msg.body,
                  sender: msg.author,
                  timestamp: new Date(msg.timestamp),
                  isFromCurrentUser: msg.author === currentUsername,
                })),
              };
            }
            return contact;
          })
        );
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessageLoadError(error.message);
      setError(error);

      // Retry logic
      if (retryCount < MAX_RETRY_COUNT) {
        console.log(`Retrying message fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchChatMessages(chatId, retryCount + 1), 1000);
      } else {
        message.error("Failed to load messages. Please try again.");
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  const createNewChat = async (values) => {
    if (!accessToken) {
      message.error("Authentication error. Please log in again.");
      return;
    }

    setAddingChat(true);

    try {
      const data = await fetchWithAuth("/chat/create/", {
        method: "POST",
        body: JSON.stringify({
          user2_username: values.username,
        }),
      });

      if (data.status === "success") {
        message.success(`Chat with ${values.username} created successfully`);

        const newChat = {
          id: data.chat.id,
          name: values.username,
          lastMessage: null,
          messages: [],
        };

        setContacts((prevContacts) => [...prevContacts, newChat]);
        setSelectedContactId(data.chat.id);
        setModalVisible(false);
        addChatForm.resetFields();
      } else {
        throw new Error(data.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      message.error(
        error.message || "Failed to create chat. Please try again."
      );
    } finally {
      setAddingChat(false);
    }
  };

  // Message handling
  const handleSendMessage = (text) => {
    if (!text.trim() || !selectedContactId) return;

    const selectedContact = contacts.find(
      (contact) => contact.id === selectedContactId
    );
    if (!selectedContact) return;

    const newMessage = {
      id: Date.now(),
      text: text,
      sender: currentUsername,
      timestamp: new Date(),
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

    // Send message via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          message: text,
          sender: currentUsername,
        })
      );
    } else {
      message.error("Connection lost. Please refresh the page.");
    }
  };

  // UI interaction handlers
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);

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
  };

  const handleAddChatModal = {
    open: () => setModalVisible(true),
    close: () => {
      setModalVisible(false);
      addChatForm.resetFields();
    },
    submit: (values) => createNewChat(values),
  };

  // Setup WebSocket connection
  const setupWebSocket = (chatId) => {
    if (!accessToken || !chatId) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new connection
    const ws = new WebSocket(
      `${WS_BASE_URL}/chatroom/${chatId}/?token=${accessToken}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`🔥 Connected to WebSocket Chatroom #${chatId}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Skip messages from self
      if (data.sender === currentUsername) return;

      const receivedMessage = {
        id: Date.now(),
        text: data.message,
        sender: data.sender,
        timestamp: new Date(),
      };

      // Update UI with received message
      setContacts((prevContacts) =>
        prevContacts.map((contact) => {
          if (contact.id === chatId) {
            return {
              ...contact,
              messages: [...(contact.messages || []), receivedMessage],
              lastMessage: {
                text: receivedMessage.text,
                timestamp: new Date(),
                isRead: true,
              },
            };
          }
          return contact;
        })
      );
    };

    ws.onerror = (err) => {
      console.error("💀 WebSocket error:", err);
      message.error("Connection error. Trying to reconnect...");
    };

    ws.onclose = () => {
      console.warn("🪦 WebSocket connection closed");
    };

    return ws;
  };

  // Effects
  // Initial data loading
  useEffect(() => {
    if (!accessToken) return;

    const initialize = async () => {
      try {
        setLoading(true);
        await fetchContacts();
      } catch (error) {
        console.error("Error initializing chats:", error);
        message.error("Failed to load chats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Set up periodic refresh
    const intervalId = setInterval(fetchContacts, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [accessToken]);

  // Load messages when selected contact changes
  useEffect(() => {
    if (selectedContactId) {
      fetchChatMessages(selectedContactId);
    }
  }, [selectedContactId]);

  // WebSocket connection management
  useEffect(() => {
    if (!accessToken || !selectedContactId) return;

    const ws = setupWebSocket(selectedContactId);

    return () => {
      if (ws) ws.close();
    };
  }, [accessToken, selectedContactId, currentUsername]);

  // UI rendering
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;
  const navbarHeight = "64px";

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
      </Flex>
    );
  }

  return (
    <Flex
      vertical
      style={{ height: "100vh", width: "100%", overflow: "hidden" }}
    >
      <ChatNavigation />
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
          />
        </Flex>

        {/* Chat Interface Section */}
        <Flex
          style={{
            flex: 1,
            width: "75%",
            overflow: "hidden",
          }}
        >
          {selectedContact ? (
            <ChatInterface
              contact={selectedContact}
              messages={selectedContact.messages || []}
              onSendMessage={handleSendMessage}
              loading={messagesLoading}
              error={messageLoadError}
            />
          ) : (
            <Flex justify="center" align="center" style={{ width: "100%" }}>
              {loading
                ? "Loading chats..."
                : "Select a chat to start messaging"}
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Add Chat Modal */}
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
            <Button type="primary" htmlType="submit" loading={addingChat} block>
              Create Chat
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}
