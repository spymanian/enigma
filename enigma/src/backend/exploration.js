import readline from 'readline';
import { promisify } from 'util';
import OpenAI from "openai";
const openai = new OpenAI();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = promisify(rl.question).bind(rl);

class Room {
    constructor(description) {
        this.description = description;
        this.connections = [];
        this.visited = false;
    }

    connect(room) {
        this.connections.push(room);
        room.connections.push(this);
    }
}

class Game {
    constructor(theme) {
        this.theme = theme;
        this.rooms = [];
    }

    async initializeRooms() {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a creative assistant." },
                {
                    role: "user",
                    content: `Generate 12 unique room names based on the theme "${this.theme}". These names should evoke the theme and fit well in a mysterious or fantastical setting. Do not number them`
                },
            ],
        });

        const roomNames = completion.choices[0].message['content'].split('\n').map(name => name.trim()).filter(name => name);
        for (let i = 0; i < 12; i++) {
            this.rooms.push(new Room(roomNames[i] || `Room ${i + 1}`));
        }
        this._connectRooms();
        this.currentRoom = this.rooms[0];
        this.currentRoom.visited = true;
    }

    _connectRooms() {
        const connections = [
            [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], 
            [1, 2], [1, 5], [1, 6], [1, 7], 
            [2, 3], [2, 7], [2, 8], 
            [3, 4], [3, 8], [3, 9], 
            [4, 5], [4, 9], [4, 10], 
            [5, 6], [5, 10], 
            [6, 7], [6, 10], [6, 11], 
            [7, 8], [7, 11], 
            [8, 9], [8, 11], 
            [9, 10], [9, 11], 
            [10, 11]
        ];
        for (const [a, b] of connections) {
            this.rooms[a].connect(this.rooms[b]);
        }
    }

    async moveToNextRoom() {
        console.log("You are currently in:");
        console.log(`- ${this.currentRoom.description}`);

        console.log("\nWhich room do you want to go to next?");
        
        this.currentRoom.connections.forEach((room, index) => {
            console.log(`${index + 1}. ${room.visited ? room.description : 'Unexplored Room'}`);
        });

        const choice = await question("Choose a room to move to (enter the number or 'q' to quit): ");
        
        if (choice.toLowerCase() === 'q') {
            console.log("Quitting the game. Goodbye!");
            rl.close();
            process.exit(0);
        }

        const index = parseInt(choice, 10) - 1;
        
        if (index >= 0 && index < this.currentRoom.connections.length) {
            this.currentRoom = this.currentRoom.connections[index];
            this.currentRoom.visited = true;
            console.log(`You have moved to ${this.currentRoom.description}`);
        } else {
            console.log("Invalid choice. Try again.");
        }
    }
}

async function main() {
    try {
        const name = await question("What's your name? ");
        const theme = await question("What's the theme of the game? ");
        
        const introCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a mastermind in a murder mystery game." },
                {
                    role: "user",
                    content: `Introduce the player in the second person point of view as an investigator named ${name} for a themed house that just had a murder of a John Doe. The theme is ${theme}. Explain that the house is shaped like an icosahedron with 12 rooms and 30 different paths. Make it one to two sentences`,
                },
            ],
        });

        console.log(introCompletion.choices[0].message['content']);
        
        const game = new Game(theme);
        await game.initializeRooms();
        
        while (true) {
            await game.moveToNextRoom();
        }
    } catch (error) {
        console.error('Error reading input:', error);
    } finally {
        rl.close();
    }
}

main();
