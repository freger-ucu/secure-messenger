import { useState, useEffect, useRef } from "react";
import { Flex, message, Button, Modal, Input, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

export default function Chat() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addChatForm] = Form.useForm();
  const [addingChat, setAddingChat] = useState(false);

  const wsRef = useRef(null);
  const accessToken = sessionStorage.getItem("accessToken");
  const currentUsername = sessionStorage.getItem("username");
  if (!currentUsername || !accessToken) {
    // Redirect to login if no username or token is found
    // Or handle this case appropriately
    console.error("No username or access token found!");
    // You could also use a useEffect to redirect
    // or show a message to the user
  }

  // Fetch all chats the user has access to
  useEffect(() => {
    const fetchChats = async () => {
      if (!accessToken) {
        console.error("❌ No access token found in sessionStorage!");
        message.error("Authentication error. Please log in again.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/chat/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.chats)) {
          const formattedContacts = data.chats.map((chat) => ({
            id: chat.id,
            name: chat.other_user || "Unknown User",
            lastMessage:
              chat.latest_message && chat.latest_message.length > 0
                ? {
                    text: chat.latest_message[0].body,
                    timestamp: new Date(chat.latest_message[0].timestamp),
                    isRead: true,
                  }
                : null,
            messages: [],
          }));

          setContacts(formattedContacts);

          if (formattedContacts.length > 0 && !selectedContactId) {
            setSelectedContactId(formattedContacts[0].id);
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        message.error("Failed to load chats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [accessToken, selectedContactId]);

  // Function to create a new chat
  const handleCreateChat = async (values) => {
    if (!accessToken) {
      message.error("Authentication error. Please log in again.");
      return;
    }

    setAddingChat(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user2_username: values.username,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        } else {
          throw new Error(`Failed to create chat: ${response.status}`);
        }
      }

      const data = await response.json();

      if (data.status === "success") {
        message.success(`Chat with ${values.username} created successfully`);

        // Add new chat to the list
        const newChat = {
          id: data.chat.id,
          name: values.username,
          lastMessage: null,
          messages: [],
        };

        setContacts((prevContacts) => [...prevContacts, newChat]);
        setSelectedContactId(data.chat_id);
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

  // Function to fetch messages for a specific chat
  const fetchChatMessages = async (chatId) => {
    if (!accessToken || !chatId) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chat/${chatId}/messages/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.messages)) {
        setContacts((prevContacts) =>
          prevContacts.map((contact) => {
            if (contact.id === chatId) {
              return {
                ...contact,
                messages: data.messages.map((msg) => ({
                  id: msg.id,
                  text: msg.body,
                  sender: msg.sender,
                  timestamp: new Date(msg.timestamp),
                })),
              };
            }
            return contact;
          })
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      message.error("Failed to load messages. Please try again.");
    }
  };

  // Connect to WebSocket for the selected chat
  useEffect(() => {
    if (!accessToken || !selectedContactId) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chatroom/${selectedContactId}/?token=${accessToken}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`🔥 Connected to WebSocket Chatroom #${selectedContactId}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.sender === currentUsername) return;

      const receivedMessage = {
        id: Date.now(),
        text: data.message,
        sender: data.sender,
        timestamp: new Date(),
      };

      setContacts((prevContacts) =>
        prevContacts.map((contact) => {
          if (contact.id === selectedContactId) {
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

    fetchChatMessages(selectedContactId);

    return () => {
      ws.close();
    };
  }, [accessToken, selectedContactId, currentUsername]);

  // Function to send messages
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

  // Function to select a contact
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

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;
  const navbarHeight = "64px";

  return (
    <Flex vertical style={{ height: "100vh", width: "100%" }}>
      <ChatNavigation />
      <Flex
        style={{
          flex: 1,
          marginTop: navbarHeight,
        }}
      >
        <Flex
          vertical
          style={{
            width: "33%",
            borderRight: "1px solid #f0f0f0",
            overflow: "auto",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <h3 style={{ margin: 0 }}>Chats</h3>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
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
        <Flex
          style={{
            flex: 1,
            width: "75%",
          }}
        >
          {selectedContact ? (
            <ChatInterface
              contact={selectedContact}
              messages={selectedContact.messages || []}
              onSendMessage={handleSendMessage}
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
        onCancel={() => {
          setModalVisible(false);
          addChatForm.resetFields();
        }}
        footer={null}
      >
        <Form form={addChatForm} layout="vertical" onFinish={handleCreateChat}>
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
