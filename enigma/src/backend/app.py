from flask import Flask, request, jsonify
from exploration import IcosahedronGraph

app = Flask(__name__)

# Initialize the game
graph = None

@app.route('/start', methods=['POST'])
def start_game():
    global graph
    data = request.json
    name = data.get('name', 'Player')
    theme = data.get('theme', 'Default Theme')
    graph = IcosahedronGraph(theme)
    intro = graph._generate_intro()  # Adjust to return the introduction
    return jsonify({'story': intro})

@app.route('/input', methods=['POST'])
def handle_input():
    global graph
    data = request.json
    user_input = data.get('input')
    response = graph.navigate(user_input)  # Adjust to handle a single user input and return a response
    return jsonify({'story': response})

if __name__ == '__main__':
    app.run(debug=True)
