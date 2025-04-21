// src/components/Chat/hooks/useChatMessages.js
import { useState, useCallback } from "react";
import { message } from "antd";
import { fetchWithAuth } from "./api";

export function useChatMessages(contacts, setContacts, selectedContactId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUsername = sessionStorage.getItem("username");
  const MAX_RETRY_COUNT = 3;

  const fetchChatMessages = useCallback(
    async (chatId, retryCount = 0) => {
      if (!chatId) return;

      setLoading(true);
      setError(null);

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
    [currentUsername, setContacts]
  );

  return {
    loading,
    error,
    fetchChatMessages,
  };
}
