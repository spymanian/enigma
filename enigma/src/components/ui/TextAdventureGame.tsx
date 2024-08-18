"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input"; // Import the Input component
import { Button } from "@/components/ui/button"; // Import the Button component

const TextAdventureGame = () => {
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const handleSendMessage = () => {
    if (currentMessage.trim() !== "") {
      // Add the player's message
      setMessages([...messages, { sender: "Human", text: currentMessage }]);
      // Clear the input field
      setCurrentMessage("");

      // Add a response from the narrator
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: "Narrator", text: currentMessage }
        ]);
      }, 500); // Delay to simulate processing time
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <strong>{message.sender}:</strong> {message.text}
          </div>
        ))}
      </div>

      <div style={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        backgroundColor: '#0000',
        padding: '16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Input
          type="text"
          placeholder="Enter your text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          style={{ flex: 1, marginRight: '8px' }}
        />
        <Button onClick={handleSendMessage}>Submit</Button>
      </div>
    </div>
  );
};

export default TextAdventureGame;
