import React, { useState } from "react";
import { Flex } from "antd";
import ChatNavigation from "./ChatNavigationBar";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";

export default function Chat() {
  // Store the currently selected contact ID
  const [selectedContactId, setSelectedContactId] = useState(null);

  const contacts = [
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
          text: "Perfect! Looking forward to seeing it.",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
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
        isRead: true,
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
    {
      id: "3",
      name: "Team Group",
      avatar: "",
      lastMessage: {
        text: "Alice: Let's discuss this at the meeting",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
      },
      isOnline: false,
      messages: [
        {
          id: 1,
          text: "Bob: Good morning team!",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
          id: 2,
          text: "Hey everyone!",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5),
        },
        {
          id: 3,
          text: "Alice: I think we should discuss the new feature at our next meeting.",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        },
        {
          id: 4,
          text: "I agree. When is the meeting scheduled?",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
        },
        {
          id: 5,
          text: "Alice: Let's discuss this at the meeting tomorrow at 10 AM.",
          sender: "contact",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        },
      ],
    },
  ];

  // Find currently selected contact data
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || contacts[0];

  // Function to handle adding a new message to a conversation
  const handleSendMessage = (text) => {
    // In a real app, this would update state or call an API
    console.log(`Sending message to ${selectedContact.name}: ${text}`);
  };

  // Calculate navbar height to match what's in ChatNavigation
  const navbarHeight = "64px"; // Estimate based on padding and content

  // Set first contact as selected by default if none is selected
  React.useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [selectedContactId]);

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
            paddingTop: "16px"
          }}
        >
          <ChatList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={setSelectedContactId}
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
