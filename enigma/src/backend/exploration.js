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
        this.npc = null;
        this.item = null;
    }

    connect(room) {
        this.connections.push(room);
        room.connections.push(this);
    }

    setNPC(npc) {
        this.npc = npc;
    }

    setItem(item) {
        this.item = item;
    }

    examine() {
        if (this.item) {
            console.log(`You see ${this.item.name}. ${this.item.description}`);
        } else {
            console.log("There is nothing of interest here.");
        }
    }

    talkToNPC() {
        if (this.npc) {
            console.log(`You talk to ${this.npc.name}.`);
            console.log(`"${this.npc.quote}"`);
        } else {
            console.log("There is no one here to talk to.");
        }
    }

    getRoomDetails() {
        return {
            description: this.description,
            npc: this.npc ? this.npc.name : 'None',
            item: this.item ? this.item.name : 'None',
        };
    }
}

class NPC {
    constructor(name, quote, isMurderer = false) {
        this.name = name;
        this.quote = quote;
        this.isMurderer = isMurderer;
    }
}

class Item {
    constructor(name, description, isMurderWeapon = false) {
        this.name = name;
        this.description = description;
        this.isMurderWeapon = isMurderWeapon;
    }
}

class Game {
    constructor(theme) {
        this.theme = theme;
        this.rooms = [];
        this.npcs = [];
        this.items = [];
    }

    async initializeRooms() {
        const roomCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a game master for a murder mystery game." },
                {
                    role: "user",
                    content: `Generate 12 unique room names based on the theme "${this.theme}". These names should evoke the theme and fit well in a mysterious or fantastical setting. Do not number them.
                    USE THIS PARSING CODE:
                           const roomNames = roomCompletion.choices[0].message['content'].split('\n').map(name => name.trim()).filter(name => name);
        for (let i = 0; i < 12; i++) {
            this.rooms.push(new Room(roomNames[i] || Room {i + 1}));}
                    `
                },
            ],
        });

        const roomNames = roomCompletion.choices[0].message['content'].split('\n').map(name => name.trim()).filter(name => name);
        for (let i = 0; i < 12; i++) {
            this.rooms.push(new Room(roomNames[i] || `Room ${i + 1}`));
        }

        await this.initializeNPCs();
        await this.initializeItems();

        this._connectRooms();
        this.currentRoom = this.rooms[0];
        this.currentRoom.visited = true;
    }

    async initializeNPCs() {
        const npcCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a game master for a murder mystery game" },
                {
                    role: "user",
                    content: `Generate 8 unique NPC names based on the theme "${this.theme}". Each should have a name and an associated quote.

                    USE THIS PARSING CODE:
                            const npcData = npcCompletion.choices[0].message['content'].split('\n').map(line => line.trim()).filter(line => line);
        for (let i = 0; i < 8; i++) {
            const [name, quote] = npcData[i].split(':').map(part => part.trim());
            this.npcs.push(new NPC(name, quote));
        }
                    
                    `
                },
            ],
        });

        const npcData = npcCompletion.choices[0].message['content'].split('\n').map(line => line.trim()).filter(line => line);
        for (let i = 0; i < 8; i++) {
            const [name, quote] = npcData[i].split(':').map(part => part.trim());
            this.npcs.push(new NPC(name, quote));
        }

        // Randomly select one NPC as the murderer
        const murdererIndex = Math.floor(Math.random() * this.npcs.length);
        this.npcs[murdererIndex].isMurderer = true;

        this.assignNPCsToRooms();
    }

    async initializeItems() {
        const itemCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a game master for a murder mystery game." },
                {
                    role: "user",
                    content: `Generate 8 unique item names and descriptions based on the theme "${this.theme}". One of these items should be the murder weapon.
                    USE THIS PARSING CODE:
                            const itemData = itemCompletion.choices[0].message['content'].split('\n').map(line => line.trim()).filter(line => line);
        for (let i = 0; i < 8; i++) {
            const [name, description] = itemData[i].split(':').map(part => part.trim());
            this.items.push(new Item(name, description));
        }

                    
                    `
                },
            ],
        });

        const itemData = itemCompletion.choices[0].message['content'].split('\n').map(line => line.trim()).filter(line => line);
        for (let i = 0; i < 8; i++) {
            const [name, description] = itemData[i].split(':').map(part => part.trim());
            this.items.push(new Item(name, description));
        }

        // Randomly select one item as the murder weapon
        const murderWeaponIndex = Math.floor(Math.random() * this.items.length);
        this.items[murderWeaponIndex].isMurderWeapon = true;

        this.assignItemsToRooms();
    }

    assignNPCsToRooms() {
        const shuffledRooms = this.rooms.slice().sort(() => 0.5 - Math.random());
        this.npcs.forEach((npc, index) => {
            shuffledRooms[index].setNPC(npc);
        });
    }

    assignItemsToRooms() {
        const shuffledRooms = this.rooms.slice().sort(() => 0.5 - Math.random());
        this.items.forEach((item, index) => {
            shuffledRooms[index].setItem(item);
        });
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

    listRoomsWithNPCsAndItems() {
        console.log("\nRooms with NPCs and Items:");
        this.rooms.forEach((room, index) => {
            const details = room.getRoomDetails();
            console.log(`${index + 1}. ${details.description}`);
            console.log(`   NPC: ${details.npc}`);
            console.log(`   Item: ${details.item}\n`);
        });
    }

    async moveToNextRoom() {
        console.log("\nYou are currently in:");
        console.log(`- ${this.currentRoom.description}`);

        console.log("\nWhich room do you want to go to next?");
        
        this.currentRoom.connections.forEach((room, index) => {
            console.log(`${index + 1}. ${room.visited ? room.description : 'Unexplored Room'}`);
        });

        const choice = await question("Choose a room to move to (enter the number, 'e' to examine the room, 't' to talk to the NPC, 'l' to list NPCs and items in all rooms, or 'q' to quit): ");
        
        if (choice.toLowerCase() === 'q') {
            console.log("Quitting the game. Goodbye!");
            rl.close();
            process.exit(0);
        } else if (choice.toLowerCase() === 'e') {
            this.currentRoom.examine();
        } else if (choice.toLowerCase() === 't') {
            this.currentRoom.talkToNPC();
        } else if (choice.toLowerCase() === 'l') {
            this.listRoomsWithNPCsAndItems();
        } else {
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
                    content: `Introduce the player in the second person point of view as an investigator named ${name} for a themed house that just had a murder of a John Doe. The theme is ${theme}. Subtlely Explain that the house is shaped like an icosahedron with 12 rooms and 30 different paths and make it more descriptive it capture an audience's attention. Make it one to two sentences.`,
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
