// src/components/Chat/hooks/useWebSocket.js
import { useEffect, useRef } from "react";
import { message } from "antd";

export function useWebSocket(chatId, contacts, setContacts) {
  const wsRef = useRef(null);
  const accessToken = sessionStorage.getItem("accessToken");
  const currentUsername = sessionStorage.getItem("username");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  const WS_BASE_URL = `ws://${API_BASE_URL}/ws`;

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
        isFromCurrentUser: false,
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

  // Send message via WebSocket
  const sendMessage = (text) => {
    if (!text.trim() || !chatId) return;

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

  // WebSocket connection management
  useEffect(() => {
    if (!accessToken || !chatId) return;

    const ws = setupWebSocket(chatId);

    return () => {
      if (ws) ws.close();
    };
  }, [accessToken, chatId, currentUsername]);

  return { sendMessage };
}
