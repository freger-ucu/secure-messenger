// src/components/Chat/hooks/useContacts.js
import { useState, useEffect } from "react";
import { message } from "antd";
import { fetchWithAuth } from "./api";

export function useContacts(selectedContactId, setSelectedContactId) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const accessToken = sessionStorage.getItem("accessToken");
  const REFRESH_INTERVAL = 5000; // 5 seconds

  const fetchContacts = async (isInitialLoad = false) => {
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

        // Handle initial contact selection in a separate effect
        if (isInitialLoad) {
          setInitialLoadComplete(true);
        }
      }
    } catch (err) {
      console.error("Error refreshing chats:", err);
      setError(err);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (!accessToken) return;

    const initialize = async () => {
      try {
        setLoading(true);
        await fetchContacts(true); // Mark this as initial load
      } catch (err) {
        console.error("Error initializing chats:", err);
        message.error("Failed to load chats. Please try again later.");
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Set up periodic refresh with regular fetchContacts (not initial)
    const intervalId = setInterval(
      () => fetchContacts(false),
      REFRESH_INTERVAL
    );
    return () => clearInterval(intervalId);
  }, [accessToken]);

  // Handle initial contact selection separately
  useEffect(() => {
    if (initialLoadComplete && contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  }, [initialLoadComplete, contacts, selectedContactId, setSelectedContactId]);

  return { contacts, setContacts, loading, error, fetchContacts };
}
