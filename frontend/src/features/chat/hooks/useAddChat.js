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
        form.resetFields();
      } else {
        // Throw an error with a specific code for better handling
        throw new Error(data.code || "UNKNOWN_ERROR");
      }
    } catch (err) {
      console.error("Error creating chat:", err);

      // Map error codes to user-friendly messages
      const errorMessage = {
        USER_NOT_FOUND: "The username you entered does not exist.",
        CHAT_ALREADY_EXISTS: "A chat with this user already exists.",
        INVALID_USERNAME: "The username is invalid. Please try again.",
        UNKNOWN_ERROR: "An unknown error occurred. Please try again later.",
      }[err.message] || "An unexpected error occurred. Please try again.";

      // Display the error message in the form and as a notification
      message.error(errorMessage);
      form.setFields([
        {
          name: "username",
          errors: [errorMessage],
        },
      ]);
    } finally {
      setAddingChat(false);
    }
  };

  return { addingChat, createNewChat };
}
