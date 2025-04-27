// src/components/Chat/hooks/useWebSocket.js
import { useEffect, useRef } from "react";
import { message } from "antd";
import { decryptMessageAES, decryptMessageRSA } from "../../../utilities/crypto";

export function useWebSocket(chatId, contacts, setContacts, symKey) {
  const wsRef = useRef(null);
  const accessToken = sessionStorage.getItem("accessToken");
  const currentUsername = sessionStorage.getItem("username");
  const API_BASE_URL = import.meta.env.VITE_API_URL;
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
      // Parse incoming JSON data
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error('Invalid WS message format:', event.data);
        return;
      }
      // Support both AES (ct+iv) or legacy RSA (message)
      const encrypted = data.ct || data.message;
      const iv = data.iv;
      const author = data.author;
      // Skip messages sent by this user
      if (author === currentUsername) return;

      // If using symmetric key, we need IV; else fallback to RSA
      if (iv && !symKey) {
        console.warn('Received AES message but symKey not loaded yet');
        return;
      }

      (async () => {
        let decryptedText;
        if (iv) {
          // AES-GCM decryption
          try {
            decryptedText = await decryptMessageAES(encrypted, iv, symKey);
          } catch (err) {
            console.error('AES-GCM decrypt error:', encrypted, iv, err);
            decryptedText = encrypted;
          }
        } else {
          // RSA fallback (legacy)
          try {
            const privJwk = JSON.parse(sessionStorage.getItem('privateKeyJwk'));
            decryptedText = await decryptMessageRSA(privJwk, encrypted);
          } catch (err) {
            console.error('RSA decrypt error:', encrypted, err);
            decryptedText = encrypted;
          }
        }
        const receivedMessage = {
          id: Date.now(),
          text: decryptedText,
          sender: author,
          timestamp: new Date(),
          isFromCurrentUser: false,
        };
        // Update UI with decrypted message
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
      })();
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
        text
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
  }, [accessToken, chatId, currentUsername, symKey]);

  return { sendMessage };
}
