"use client";

import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Button, TextField, Card, CardContent, Typography } from '@mui/material';

interface LogEntry {
    input: string;
    story: string;
}

const TextAdventureGame: React.FC = () => {
    const [story, setStory] = useState<string>("You find yourself in a dark forest. Paths lead to the north and south.");
    const [input, setInput] = useState<string>("");
    const [log, setLog] = useState<LogEntry[]>([]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setInput(e.target.value);
    };

    const handleInputSubmit = (): void => {
        if (input.trim() === "") return;

        let newStory = story;
        if (input.toLowerCase() === "north") {
            newStory = "You walk north and find a clearing with a pond.";
        } else if (input.toLowerCase() === "south") {
            newStory = "You head south and stumble upon a small village.";
        } else {
            newStory = "You can't go that way.";
        }

        setLog([...log, { input, story: newStory }]);
        setStory(newStory);
        setInput("");
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        }
    };

    return (
        <Card>
            <CardContent>
                <div>
                    <Typography variant="h4">Text Adventure Game</Typography>
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
