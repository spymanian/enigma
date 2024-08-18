const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.MY_API_KEY,
});
const openai = new OpenAIApi(configuration);

class Room {
  constructor(description, reportItem = null, murderer = null) {
    this.description = description;
    this.connections = [];
    this.npcs = [];
    this.items = [];
    this.isCrimeScene = false;
    this.reportItem = reportItem;
    this.murderer = murderer;
    this.visited = false; // Add visited attribute
  }

  connect(otherRoom) {
    this.connections.push(otherRoom);
    otherRoom.connections.push(this);
  }

  addNpc(npc) {
    this.npcs.push(npc);
  }

  addItem(item) {
    this.items.push(item);
  }

  setCrimeScene() {
    this.isCrimeScene = true;
  }

  async examineItems() {
    if (this.items.length === 0) {
      console.log("There are no items to examine in this room.");
    } else {
      for (const item of this.items) {
        console.log(`You examine the ${item}.`);
        const response = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a player in a murder mystery game. However, do not mention you are part of a game.",
            },
            {
              role: "user",
              content: `Describe the appearance and any evidence that can pinpoint the murderer for the item: ${item}. Try to relate the description to the murder item: ${this.reportItem} and the murderer: ${this.murderer}. Do not reveal the murderer or the murder item. Be subtle about the murder item and do not directly name it if the ${item} that you are examining is not the murder item. Make it at most one to two sentences.`,
            },
          ],
        });
        console.log(response.data.choices[0].message.content);
      }
    }
  }

  takeItem(itemName) {
    const itemIndex = this.items.indexOf(itemName);
    if (itemIndex !== -1) {
      const item = this.items.splice(itemIndex, 1)[0];
      console.log(`You take the ${item}.`);
      return item;
    } else {
      console.log(`No item named ${itemName} found in this room.`);
      return null;
    }
  }
}

class IcosahedronGraph {
  constructor(theme) {
    this.theme = theme;
    this.rooms = [];
    this.npcs = [];
    this.items = [];
    this.currentRoom = null;
    this.inventory = [];
    this.murderer = null;
    this.reportItem = null;
    this._initializeGraph();
  }

  async _initializeGraph() {
    this.rooms = await this._generateRooms("room names", 12);
    this._connectRooms();
    this.npcs = await this._generateNames("NPC names", 5);
    this.items = await this._generateNames("item names", 8);
    this._addNpcsAndItems();
    this._setRandomCrimeScene();
    this.murderer = this._setRandomMurderer();
    this.reportItem = this._getRandomItem();
    this._assignCrimeInfo();
  }

  async _generateRooms(category, count) {
    const names = await this._generateNames(category, count);
    return names.map((name) => new Room(name));
  }

  async _generateNames(category, count) {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate ${count} unique ${category} based on the theme '${this.theme}'.`,
        },
        {
          role: "user",
          content:
            "Make room and item names different and distinct names to avoid confusion for player.",
        },
      ],
    });
    const rawNames = response.data.choices[0].message.content
      .trim()
      .split("\n");
    const cleanedNames = rawNames.map((name) =>
      name.split(". ", 1).pop().trim()
    );
    return cleanedNames;
  }

  _connectRooms() {
    const connections = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [1, 2],
      [1, 5],
      [1, 6],
      [1, 7],
      [2, 3],
      [2, 7],
      [2, 8],
      [3, 4],
      [3, 8],
      [3, 9],
      [4, 5],
      [4, 9],
      [4, 10],
      [5, 6],
      [5, 10],
      [6, 7],
      [6, 10],
      [6, 11],
      [7, 8],
      [7, 11],
      [8, 9],
      [8, 11],
      [9, 10],
      [9, 11],
      [10, 11],
    ];
    connections.forEach(([a, b]) => {
      this.rooms[a].connect(this.rooms[b]);
    });
  }

  _addNpcsAndItems() {
    this.npcs.forEach((npc) => {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      room.addNpc(npc);
    });

    this.items.forEach((item) => {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      room.addItem(item);
    });
  }

  _setRandomCrimeScene() {
    const crimeSceneRoom =
      this.rooms[Math.floor(Math.random() * this.rooms.length)];
    crimeSceneRoom.setCrimeScene();
  }

  _setRandomMurderer() {
    return this.npcs[Math.floor(Math.random() * this.npcs.length)];
  }

  _getRandomItem() {
    const allItems = this.rooms.flatMap((room) => room.items);
    return allItems[Math.floor(Math.random() * allItems.length)];
  }

  _assignCrimeInfo() {
    this.rooms.forEach((room) => {
      room.reportItem = this.reportItem;
      room.murderer = this.murderer;
    });
  }

  async _generateIntro() {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a player in a murder mystery game.",
        },
        {
          role: "user",
          content: `Introduce the player in the second person point of view as an investigator named for a themed house that just had a murder of a John Doe. The theme is ${this.theme}. Explain that the house is shaped like icosahedron with 12 rooms and 30 different paths. Make it one to two sentences.`,
        },
      ],
    });
    console.log(response.data.choices[0].message.content);
  }

  async navigate(action = null) {
    if (!action) {
      return this._generateIntro();
    }

    let response = "";
    let currentRoom = this.currentRoom || this.rooms[0];
    currentRoom.visited = true;
    let inventory = this.inventory;

    switch (action) {
      case "1":
        response += "Which room do you want to go to next? \nRooms:\n";
        currentRoom.connections.forEach((room, i) => {
          response += `${i + 1}. ${room.visited ? room.description : "Unexplored Room"}\n`;
        });
        break;
      case "2":
        await currentRoom.examineItems();
        break;
      case "3":
        const itemName = prompt("Enter the name of the item you want to take: ");
        const item = currentRoom.takeItem(itemName);
        if (item) {
          inventory.push(item);
        }
        break;
      case "4":
        if (inventory.length === 0) {
          response += "Your inventory is empty.";
        } else {
          response += "Inventory:\n";
          inventory.forEach((item) => {
            response += ` - ${item}\n`;
          });
        }
        break;
      case "5":
        if (currentRoom.npcs.length > 0) {
          response += "Which NPC do you want to interact with?\n";
          currentRoom.npcs.forEach((npc, i) => {
            response += `${i + 1}. ${npc}\n`;
          });
        } else {
          response += "There are no NPCs to interact with in this room.";
        }
        break;
      case "6":
        const murdererGuess = prompt("Enter the name of the murderer: ");
        const itemGuess = prompt("Enter the name of the item you think is the murder weapon: ");
        if (murdererGuess === this.murderer && inventory.includes(itemGuess)) {
          response += `You correctly identified the murderer and the murder weapon! The murderer is ${this.murderer} and the murder weapon is ${itemGuess}!`;
        } else {
          response += "Incorrect guess. Either the murderer or the item is wrong. Try again.";
        }
        break;
      default:
        response += "Invalid action. Please try again.";
    }

    this.currentRoom = currentRoom;
    this.inventory = inventory;
    return response;
  }
}

(async () => {
  const theme = prompt("Enter a theme for the game: ");
  const game = new IcosahedronGraph(theme);
  await game.navigate();
})();
