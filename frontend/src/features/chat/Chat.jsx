import React, { useState, useEffect } from "react";
import { Flex } from "antd";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

export default function Chat() {
  // Store the currently selected contact ID
  const [selectedContactId, setSelectedContactId] = useState(null);
  // Store contacts with their messages in state
  const [contacts, setContacts] = useState([
    {
      id: "1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
      lastMessage: {
        text: "Hey, are we still meeting tomorrow?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: false,
      },
      isOnline: true,
      messages: [
        {
          id: 1,
          text: "Hey there! How's it going?",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: 2,
          text: "I'm doing well, thanks for asking! Just working on that project we discussed.",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
        },
        {
          id: 3,
          text: "That's great to hear. How's the progress?",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
        },
        {
          id: 4,
          text: "Making good headway. I should have the first draft ready by tomorrow.",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
          id: 5,
          text: "Hey, are we still meeting tomorrow?",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
      ],
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=5",
      lastMessage: {
        text: "The project files have been uploaded to the shared folder",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isRead: false,
      },
      isOnline: false,
      messages: [
        {
          id: 1,
          text: "Hi! I've uploaded the project files to the shared folder.",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 65),
        },
        {
          id: 2,
          text: "Thanks Jane! I'll take a look at them soon.",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 63),
        },
        {
          id: 3,
          text: "Let me know if you need any clarification on the requirements.",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 62),
        },
        {
          id: 4,
          text: "Will do. Are there any specific areas I should focus on first?",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 61),
        },
        {
          id: 5,
          text: "The project files have been uploaded to the shared folder.",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
      ],
    },
  ]);

  // Find currently selected contact data
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || contacts[0];

  // Function to handle adding a new message to a conversation
  const handleSendMessage = (text) => {
    // Get the highest message ID to ensure unique IDs
    const getNewMessageId = (messages) => {
      const highestId = Math.max(...messages.map((msg) => msg.id), 0);
      return highestId + 1;
    };

    // Create a new message object
    const newMessage = {
      id: getNewMessageId(selectedContact.messages),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    // Update the contacts state with the new message
    setContacts((prevContacts) => {
      return prevContacts.map((contact) => {
        if (contact.id === selectedContact.id) {
          // Update this contact's messages and lastMessage
          return {
            ...contact,
            messages: [...contact.messages, newMessage],
            lastMessage: {
              text: text,
              timestamp: new Date(),
              isRead: true,
            },
          };
        }
        return contact;
      });
    });
  };

  // Function to handle selecting a contact and marking messages as read
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);

    // Mark unread messages as read when selecting a contact
    setContacts((prevContacts) => {
      return prevContacts.map((contact) => {
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
      });
    });
  };

  // Calculate navbar height to match what's in ChatNavigation
  const navbarHeight = "72px"; // Estimate based on padding and content

  // Set first contact as selected by default if none is selected
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);

      // Mark the first contact's messages as read if it becomes the default selection
      if (contacts[0] && !contacts[0].lastMessage.isRead) {
        setContacts((prevContacts) => {
          const updatedContacts = [...prevContacts];
          updatedContacts[0] = {
            ...updatedContacts[0],
            lastMessage: {
              ...updatedContacts[0].lastMessage,
              isRead: true,
            },
          };
          return updatedContacts;
        });
      }
    }
  }, []);

  return (
    <Flex vertical style={{ height: "100vh", width: "100%" }}>
      <ChatNavigation />
      <Flex
        style={{
          flex: 1,
          marginTop: navbarHeight, // Add margin to account for fixed navbar
        }}
      >
        <Flex
          style={{
            width: "33%",
            borderRight: "1px solid #f0f0f0",
            overflow: "auto",
            paddingTop: "16px",
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
