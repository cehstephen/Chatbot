import subprocess
import sys
import os
from multiprocessing import Process
import webbrowser
import time


def run_rasa_server():
    subprocess.run([sys.executable, "-m", "rasa", "run", "--enable-api", "--cors", "*"])


def run_action_server():
    subprocess.run([sys.executable, "-m", "rasa", "run", "actions"])


def initialize_and_train():
    # Initialize knowledge base
    print("Initializing knowledge base...")
    subprocess.run([sys.executable, "init_knowledge_base.py"])

    # Train the model
    print("Training Rasa model...")
    subprocess.run([sys.executable, "-m", "rasa", "train"])


def main():
    # Create virtual environment
    if not os.path.exists("venv"):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])

        # Activate virtual environment and install requirements
        if os.name == "nt":  # Windows
            pip_path = os.path.join("venv", "Scripts", "pip")
        else:  # Unix/Linux
            pip_path = os.path.join("venv", "bin", "pip")

        print("Installing requirements...")
        subprocess.run([pip_path, "install", "-r", "requirements.txt"])

    # Initialize and train
    initialize_and_train()

    # Start Rasa and Action servers
    print("Starting Rasa servers...")
    rasa_process = Process(target=run_rasa_server)
    action_process = Process(target=run_action_server)

    rasa_process.start()
    action_process.start()

    # Wait for servers to start
    time.sleep(5)

    print("\nRasa chatbot is now running!")
    print("Rasa server: http://localhost:5005")
    print("Action server: http://localhost:5055")

    try:
        # Keep the script running
        rasa_process.join()
        action_process.join()
    except KeyboardInterrupt:
        print("\nShutting down...")
        rasa_process.terminate()
        action_process.terminate()
        rasa_process.join()
        action_process.join()


if __name__ == "__main__":
    main()