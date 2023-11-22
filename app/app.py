import threading
from flask import Flask, jsonify, render_template, request, send_from_directory
import bot.chatbot as bot


app = Flask(__name__, template_folder='templates', static_folder='static')
chat_history = []
bot_initialized = True

def initialize_bot():
    bot.initialize()
    
threading.Thread(target=initialize_bot).start()

@app.route('/')
def index():
    return render_template('index.html', response="Hola, soy Banker, ¿En qué puedo ayudarte?")

@app.route('/query', methods=['POST'])
def query_bot():
    try:
        user_input = request.json['user_input']
        print(f"[User]: {user_input}")

        # Process the user input and get the bot response
        response = bot.get_response(user_input)
        print(response)
        # Append the interaction to chat history
        chat_history.append((user_input, response))
        print("Response from bot")

        return jsonify({'response': response})

    except Exception as e:
        return jsonify({'error': 'An error occurred while processing the message'}), 500

@app.route('/themes', methods=['GET'])
def get_themes():
    try:
        themes = bot.get_themes()
        print(themes)
        return jsonify({'themes': themes})

    except Exception as e:
        return jsonify({'error': 'An error occurred while processing the message'}), 500
    
    
@app.errorhandler(Exception)
def handle_error(e):
    app.logger.error(f"An error occurred: {str(e)}")
    return "An error occurred. Please check the logs for details.", 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)



if __name__ == '__main__':
    app.run(debug=True)

