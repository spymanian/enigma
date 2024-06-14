import random
from openai import OpenAI
import openai
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key = os.environ.get("MY_API_KEY"),
)

class Room:
    def __init__(self, description):
        self.description = description
        self.connections = []
        self.npcs = []
        self.items = []
        self.is_crime_scene = False

    def connect(self, other_room):
        self.connections.append(other_room)
        other_room.connections.append(self)

    def add_npc(self, npc):
        self.npcs.append(npc)

    def add_item(self, item):
        self.items.append(item)

    def set_crime_scene(self):
        self.is_crime_scene = True

    def examine_items(self):
        if not self.items:
            print("There are no items to examine in this room.")
        else:
            for item in self.items:
                print(f"You examine the {item}.")

    def take_item(self, item_name):
        for item in self.items:
            if item == item_name:
                self.items.remove(item)
                print(f"You take the {item}.")
                return item
        print(f"No item named {item_name} found in this room.")
        return None

class IcosahedronGraph:
    def __init__(self, theme):
        self.theme = theme
        self.rooms = [Room(name) for name in self._generate_names("room names", 12)]
        self._connect_rooms()
        self.npcs = self._generate_names("NPC names", 5)
        self.items = self._generate_names("item names", 8)
        self._add_npcs_and_items()
        self._set_random_crime_scene()
        self.murderer = self._set_random_murderer()
        self.report_item = random.choice(self._get_all_items())

    def _generate_names(self, category, count):
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Generate {count} unique {category} based on the theme '{self.theme}'."}
            ]
        )
        raw_names = response.choices[0].message.content.strip().split('\n')
        cleaned_names = [name.split('. ', 1)[-1].strip().strip("-").strip("'\"").strip() for name in raw_names if name.strip()]     
        return cleaned_names

    def _connect_rooms(self):
        connections = [
            (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), 
            (1, 2), (1, 5), (1, 6), (1, 7), 
            (2, 3), (2, 7), (2, 8), 
            (3, 4), (3, 8), (3, 9), 
            (4, 5), (4, 9), (4, 10), 
            (5, 6), (5, 10), 
            (6, 7), (6, 10), (6, 11), 
            (7, 8), (7, 11), 
            (8, 9), (8, 11), 
            (9, 10), (9, 11), 
            (10, 11)
        ]
        for a, b in connections:
            self.rooms[a].connect(self.rooms[b])

    def _add_npcs_and_items(self):
        for npc in self.npcs:
            room = random.choice(self.rooms)
            room.add_npc(npc)
        
        for item in self.items:
            room = random.choice(self.rooms)
            room.add_item(item)

    def _set_random_crime_scene(self):
        crime_scene_room = random.choice(self.rooms)
        crime_scene_room.set_crime_scene()
    
    def _set_random_murderer(self):
        return random.choice(self.npcs)

    def _get_all_items(self):
        items = []
        for room in self.rooms:
            items.extend(room.items)
        return items

    def _interact_with_npc(self, npc):
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "In the second person point of view as the player, describe an NPC interaction in a murder mystery game."},
                {"role": "user", "content": f"Describe the interaction with {npc} in one or two sentences"}
            ]
        )
        print(response.choices[0].message.content)

    def navigate(self):
        current_room = self.rooms[0]
        inventory = []

        while True:
            print("You are currently in the "+ current_room.description)
            
            if current_room.is_crime_scene:
                print("This room is a CRIME SCENE.")
            
            if current_room.npcs:
                print("NPCs in the room:")
                for npc in current_room.npcs:
                    print(f" - {npc}")
            if current_room.items:
                print("Items in the room:")
                for item in current_room.items:
                    print(f" - {item}")

            print("\nAvailable actions:")
            print("1. Move to another room")
            print("2. Examine items")
            print("3. Take an item")
            print("4. View inventory")
            print("5. Interact with an NPC")
            print("6. Report the crime")
            print("q. Quit")

            action = input("Choose an action: ")
            if action == 'q':
                break
            elif action == '1':
                print("Which room do you want to go to next? \nRooms:")
                for i, room in enumerate(current_room.connections):
                    print(f"{i + 1}. {room.description}")
                choice = input("Choose a room to move to: ")
                try:
                    index = int(choice) - 1
                    if 0 <= index < len(current_room.connections):
                        current_room = current_room.connections[index]
                    else:
                        print("Invalid choice. Try again.")
                except ValueError:
                    print("Invalid input. Please enter a number.")
            elif action == '2':
                current_room.examine_items()
            elif action == '3':
                item_name = input("Enter the name of the item you want to take: ")
                item = current_room.take_item(item_name)
                if item:
                    inventory.append(item)
            elif action == '4':
                if not inventory:
                    print("Your inventory is empty.")
                else:
                    print("Inventory:")
                    for item in inventory:
                        print(f" - {item}")
            elif action == '5':
                if current_room.npcs:
                    print("Which NPC do you want to interact with?")
                    for i, npc in enumerate(current_room.npcs):
                        print(f"{i + 1}. {npc}")
                    choice = input("Choose an NPC to interact with: ")
                    try:
                        index = int(choice) - 1
                        if 0 <= index < len(current_room.npcs):
                            self._interact_with_npc(current_room.npcs[index])
                        else:
                            print("Invalid choice. Try again.")
                    except ValueError:
                        print("Invalid input. Please enter a number.")
                else:
                    print("There are no NPCs to interact with in this room.")
            elif action == '6':
                if self.report_item in inventory:
                    print("You use the report item to report the crime.")
                    print(f"The murderer is {self.murderer}!")
                    break
                else:
                    print(f"You need the {self.report_item} to report the crime.")
            else:
                print("Invalid action. Please try again.")

if __name__ == "__main__":
    theme = input("Enter a theme for the game: ")
    IcosahedronGraph(theme).navigate()