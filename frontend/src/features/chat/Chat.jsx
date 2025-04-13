import { useState, useEffect, useRef } from "react";
import { Flex } from "antd";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

export default function Chat() {
  const [selectedContactId, setSelectedContactId] = useState(1); // Always show chat with id 1
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "uname1",
      lastMessage: { text: "Hello!", timestamp: new Date(), isRead: true },
      messages: [],
    },
    {
      id: 2,
      name: "uname2",
      lastMessage: { text: "Hi!", timestamp: new Date(), isRead: false },
      messages: [],
    },
  ]);

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;

  const wsRef = useRef(null);
  const accessToken = sessionStorage.getItem("accessToken");
  const currentUsername = "uname1"; // This should come from your auth system

  // Connect to WebSocket chatroom 1, with the accessToken from sessionStorage
  useEffect(() => {
    if (!accessToken) {
      console.error("❌ No access token found in sessionStorage!");
      return;
    }

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chatroom/1/?token=${accessToken}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🔥 Connected to WebSocket Chatroom #1");
    };

    // Handle incoming messages (broadcasted by others)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Ignore messages sent by the current user (they're already shown locally)
      if (data.sender === currentUsername) return;

      const receivedMessage = {
        id: Date.now(),
        text: data.message,
        sender: data.sender,
        timestamp: new Date(),
      };

      // Update both contacts with the received message
      setContacts((prevContacts) =>
        prevContacts.map((contact) => ({
          ...contact,
          messages: [...contact.messages, receivedMessage],
          lastMessage: {
            text: receivedMessage.text,
            timestamp: new Date(),
            isRead: contact.id === selectedContactId,
          },
        }))
      );
    };

    ws.onerror = (err) => {
      console.error("💀 WebSocket error:", err);
    };

    ws.onclose = () => {
      console.warn("🪦 WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [accessToken, selectedContactId, currentUsername]);

  // Function to send messages
  const handleSendMessage = (text) => {
    if (!text.trim() || !selectedContact) return;

    const newMessage = {
      id: Date.now(),
      text: text,
      sender: currentUsername,
      timestamp: new Date(),
    };

    // If the message is from the current user, we don’t need to echo it back
    setContacts((prevContacts) =>
      prevContacts.map((contact) => {
        const isUserMessage = contact.name === currentUsername;
        const updatedMessages = isUserMessage
          ? [...contact.messages, newMessage]
          : contact.messages;

        return {
          ...contact,
          messages: updatedMessages,
          lastMessage: {
            text: text,
            timestamp: new Date(),
            isRead: contact.id === selectedContactId,
          },
        };
      })
    );

    // Send the message to WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          message: text,
          sender: currentUsername,
        })
      );
    }
  };

  // Function to select a contact
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);

    // Mark messages as read when selecting a contact
    setContacts((prevContacts) =>
      prevContacts.map((contact) => {
        if (contact.id === contactId && !contact.lastMessage.isRead) {
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
          style={{
            width: "33%",
            borderRight: "1px solid #f0f0f0",
            overflow: "auto",
          }}
        >
          <ChatList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
          />
        </Flex>
        <Flex
          style={{
            flex: 1,
            width: "75%",
          }}
        >
          <ChatInterface
            contact={selectedContact}
            messages={selectedContact?.messages || []}
            onSendMessage={handleSendMessage}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
