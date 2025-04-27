// src/components/Chat/hooks/useContacts.js
import { useState, useEffect } from "react";
import { message } from "antd";
import { fetchWithAuth } from "./api";
import { decryptMessageAES, decryptRSA, importSymKey } from '../../../utilities/crypto';

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
      const data = await fetchWithAuth("/api/chat/");

      if (data.status === "success" && Array.isArray(data.chats)) {
        let formattedContacts = data.chats.map((chat) => {
          // Parse public key (stored as JSON string or object)
          let publicKey = chat.public_key;
          try {
            if (typeof publicKey === 'string') publicKey = JSON.parse(publicKey);
          } catch (_) {
            console.warn('Failed to parse public_key for chat', chat.id);
          }
          const latest = chat.latest_message?.[0];
          return {
            id: chat.id,
            name: chat.other_user || 'Unknown User',
            publicKey,
            lastMessage: latest
              ? {
                  ct: latest.body,
                  iv: latest.iv,
                  timestamp: new Date(latest.timestamp),
                  isRead: true,
                }
              : null,
            messages: [],
          };
        });

        // For each chat, fetch symmetric key, decrypt preview
        formattedContacts = await Promise.all(
          formattedContacts.map(async (c) => {
            if (c.lastMessage && c.lastMessage.ct && c.lastMessage.iv) {
              try {
                // fetch chat key for this chat
                const keyData = await fetchWithAuth(`api/chat/${c.id}/key/`);
                const privJwk = JSON.parse(
                  sessionStorage.getItem('privateKeyJwk')
                );
                const rawKey = await decryptRSA(privJwk, keyData.encrypted_key);
                const aesKey = await importSymKey(rawKey);
                // decrypt preview
                c.lastMessage.text = await decryptMessageAES(
                  c.lastMessage.ct,
                  c.lastMessage.iv,
                  aesKey
                );
              } catch (err) {
                console.error('Error decrypting chat preview', c.id, err);
                c.lastMessage.text = c.lastMessage.ct;
              }
            }
            return c;
          })
        );

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

  // Re-fetch contacts whenever a new chat is added and symKey is ready
  useEffect(() => {
    if (contacts.length > 0) {
      fetchContacts(false);
    }
  }, [contacts.length]);

  return { contacts, setContacts, loading, error, fetchContacts };
}
