# Local Rasa Documentation Assistant

## Setup and Installation

1. Prerequisites:
   - Python 3.8 or later
   - pip (Python package installer)

2. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd docs_assistant
   ```

3. Start the assistant:
   - Windows: Double-click `start.bat` or run `python run_local.py`
   - Unix/Linux: Run `./start.sh` or `python3 run_local.py`

4. The script will automatically:
   - Create a virtual environment
   - Install required packages
   - Initialize the knowledge base
   - Train the Rasa model
   - Start both Rasa and Action servers

## Adding Documentation

1. Place your documentation files in the `docs` folder
2. Supported formats:
   - Markdown (.md)
   - PDF (.pdf)
   - Word (.doc, .docx)
   - JSON (.json)

3. Update web documentation URLs in `init_knowledge_base.py`

4. Restart the assistant to update the knowledge base

## Usage

1. The chat widget will connect to:
   - Rasa server: http://localhost:5005
   - Action server: http://localhost:5055

2. You can also test using curl:
   ```bash
   curl -X POST \
     http://localhost:5005/webhooks/rest/webhook \
     -H 'Content-Type: application/json' \
     -d '{
       "sender": "user",
       "message": "how do I connect to the database?"
     }'
   ```

## Maintenance

- To update the knowledge base: `python init_knowledge_base.py`
- To retrain the model: `rasa train`
- To start servers separately:
  - Rasa server: `rasa run --enable-api --cors "*"`
  - Action server: `rasa run actions`

## Project Structure

```
docs_assistant/
├── actions/
│   ├── __init__.py
│   ├── actions.py
│   ├── doc_scraper.py
│   ├── doc_store.py
│   └── knowledge_base.py
├── data/
│   ├── nlu.yml
│   ├── rules.yml
│   └── stories.yml
├── docs/
│   └── # Your documentation files
├── config/
│   └── endpoints.yml
├── domain.yml
├── config.yml
├── credentials.yml
├── requirements.txt
├── run_local.py
├── init_knowledge_base.py
├── start.bat
└── start.sh
```