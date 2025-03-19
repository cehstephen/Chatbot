from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger
from werkzeug.middleware.proxy_fix import ProxyFix
import asyncio
import uuid
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all origins
CORS(app)
app.wsgi_app = ProxyFix(app.wsgi_app)

# Configure Swagger
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs/"
}

swagger = Swagger(app, config=swagger_config)

# In-memory storage for chat history
# In a production app, you would use a database
chat_history = {}

# Mock AI response function (replace with actual AI integration)
async def get_ai_response(message, conversation_id):
    # Simulate async processing
    await asyncio.sleep(0.5)
    
    # Add your AI model integration here
    # For example:
    # response = await your_ai_model.generate_response(message, history)
    
    # Mock response for demonstration
    response = f"AI response to: {message} (conversation: {conversation_id})"
    return response

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Send a message to the AI assistant
    ---
    tags:
      - Chat
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            message:
              type: string
              description: The user's message
            conversation_id:
              type: string
              description: Optional conversation ID to continue a conversation
    responses:
      200:
        description: AI response
        schema:
          type: object
          properties:
            response:
              type: string
              description: The AI's response
            conversation_id:
              type: string
              description: The conversation ID
    """
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400
    
    user_message = data['message']
    conversation_id = data.get('conversation_id', str(uuid.uuid4()))
    
    # Get or create conversation history
    if conversation_id not in chat_history:
        chat_history[conversation_id] = []
    
    # Add user message to history
    chat_history[conversation_id].append({"role": "user", "content": user_message})
    
    # Get AI response (async in a non-async context)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    ai_response = loop.run_until_complete(get_ai_response(user_message, conversation_id))
    loop.close()
    
    # Add AI response to history
    chat_history[conversation_id].append({"role": "assistant", "content": ai_response})
    
    return jsonify({
        "response": ai_response,
        "conversation_id": conversation_id
    })

@app.route('/api/chat/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """
    Get conversation history by ID
    ---
    tags:
      - Chat
    parameters:
      - name: conversation_id
        in: path
        type: string
        required: true
        description: The conversation ID
    responses:
      200:
        description: Conversation history
        schema:
          type: object
          properties:
            conversation_id:
              type: string
            messages:
              type: array
              items:
                type: object
                properties:
                  role:
                    type: string
                  content:
                    type: string
      404:
        description: Conversation not found
    """
    if conversation_id not in chat_history:
        return jsonify({"error": "Conversation not found"}), 404
    
    return jsonify({
        "conversation_id": conversation_id,
        "messages": chat_history[conversation_id]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    ---
    tags:
      - System
    responses:
      200:
        description: Service is running
    """
    return jsonify({
        "status": "healthy",
        "timestamp": time.time()
    })

@app.route('/', methods=['GET'])
def index():
    """
    Home/Index endpoint
    ---
    tags:
      - System
    responses:
      200:
        description: You are welcome
    """
    return jsonify({
        "message": "Welcome!"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
