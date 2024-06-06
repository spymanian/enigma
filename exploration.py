class Room:
    def __init__(self, description):
        self.description = description
        self.connections = []

    def connect(self, other_room):
        self.connections.append(other_room)
        other_room.connections.append(self)

class IcosahedronGraph:
    def __init__(self):
        self.rooms = [Room(f"Room {i+1}") for i in range(12)]
        self._connect_rooms()

    def _connect_rooms(self):
        # Manually connect rooms to form an icosahedron graph
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

    def navigate(self):
        current_room = self.rooms[0]
        while True:
            print(current_room.description)
            print("Which room do you want to go to next? \nRooms:")
            for i, room in enumerate(current_room.connections):
                print(f"{i + 1}. {room.description}")

            choice = input("Choose a room to move to (or 'q' to quit): ")
            if choice.lower() == 'q':
                break
            try:
                index = int(choice) - 1
                if 0 <= index < len(current_room.connections):
                    current_room = current_room.connections[index]
                else:
                    print("Invalid choice. Try again.")
            except ValueError:
                print("Invalid input. Please enter a number.")

if __name__ == "__main__":
    graph = IcosahedronGraph()
    graph.navigate()
