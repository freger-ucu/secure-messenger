// src/components/Chat/hooks/useChatMessages.js
import { useState, useCallback } from "react";
import { message } from "antd";
import { fetchWithAuth } from "./api";
import { decryptMessageAES } from "../../../utilities/crypto";

export function useChatMessages(contacts, setContacts, selectedContactId, symKey) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUsername = sessionStorage.getItem("username");
  const MAX_RETRY_COUNT = 3;

  const fetchChatMessages = useCallback(
    async (chatId, retryCount = 0) => {
      if (!chatId) return;

      if (!symKey) return; // wait for symmetric key
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWithAuth(`/api/api/chat/${chatId}/history/`);

        if (data.status === "success" && Array.isArray(data.messages)) {
          console.log(
            `Loaded ${data.messages.length} messages for chat #${chatId}`
          );

          // Decrypt each message using AES-GCM
          const decrypted = await Promise.all(
            data.messages.map(async (msg) => {
              let plaintext = msg.body;
              if (msg.iv && msg.body) {
                try {
                  plaintext = await decryptMessageAES(msg.body, msg.iv, symKey);
                } catch (err) {
                  console.error('Error decrypting message', msg.id, err);
                }
              }
              return {
                id: msg.id,
                text: plaintext,
                sender: msg.author,
                timestamp: new Date(msg.timestamp),
                isFromCurrentUser: msg.author === currentUsername,
              };
            })
          );
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === chatId ? { ...contact, messages: decrypted } : contact
            )
          );
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err);

        // Retry logic
        if (retryCount < MAX_RETRY_COUNT) {
          console.log(`Retrying message fetch (attempt ${retryCount + 1})...`);
          setTimeout(() => fetchChatMessages(chatId, retryCount + 1), 1000);
        } else {
          message.error("Failed to load messages. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [currentUsername, setContacts, symKey]
  );

  return {
    loading,
    error,
    fetchChatMessages,
  };
}
