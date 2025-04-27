// src/components/Chat/hooks/useAddChat.js
import { useState } from "react";
import { message } from "antd";
import { fetchWithAuth } from "./api";

export function useAddChat(setContacts, setSelectedContactId) {
  const [addingChat, setAddingChat] = useState(false);

  const createNewChat = async (values, form, setModalVisible) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      message.error("Authentication error. Please log in again.");
      return;
    }

    setAddingChat(true);

    try {
      const data = await fetchWithAuth("/api/chat/create/", {
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
        form.resetFields();
      } else {
        throw new Error(data.message || "Failed to create chat");
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      message.error(err.message || "Failed to create chat. Please try again.");
    } finally {
      setAddingChat(false);
    }
  };

  return { addingChat, createNewChat };
}
