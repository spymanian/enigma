"use client";

import React, { useState, useEffect } from 'react';
import { Button, TextField, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';

interface LogEntry {
    input: string;
    story: string;
}

const TextAdventureGame: React.FC = () => {
    const [story, setStory] = useState<string>("");
    const [input, setInput] = useState<string>("");
    const [log, setLog] = useState<LogEntry[]>([]);

    useEffect(() => {
        const startGame = async () => {
            const name = prompt("What is your name?") || "Player";
            const theme = prompt("Enter a theme for the game:") || "Default Theme";
            const response = await axios.post('/start', { name, theme });
            setStory(response.data.story);
        };
        startGame();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setInput(e.target.value);
    };

    const handleInputSubmit = async (): Promise<void> => {
        if (input.trim() === "") return;
    
        try {
            const response = await axios.post('/input', { input });
            const newStory = response.data.story;
    
            setLog([...log, { input, story: newStory }]);
            setStory(newStory);
            setInput("");
        } catch (error) {
            console.error("Failed to submit input:", error);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        }
    };

    return (
        <Card>
            <CardContent>
                <div>
                    <Typography variant="h4">Let's Start!</Typography>
                    <Typography variant="body1">{story}</Typography>
                    <TextField 
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="What do you want to do?"
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" onClick={handleInputSubmit}>Submit</Button>
                </div>
                <div>
                    <Typography variant="h5">Adventure Log</Typography>
                    {log.map((entry, index) => (
                        <div key={index}>
                            <Typography variant="body2"><strong>Command:</strong> {entry.input}</Typography>
                            <Typography variant="body2"><strong>Result:</strong> {entry.story}</Typography>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TextAdventureGame;
