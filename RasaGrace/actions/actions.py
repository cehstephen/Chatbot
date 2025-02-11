# File: actions/actions.py
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from .knowledge_base import KnowledgeBase
import logging

logger = logging.getLogger(__name__)


class ActionSearchDocs(Action):
    def __init__(self):
        self.knowledge_base = KnowledgeBase()

    def name(self) -> Text:
        return "action_search_docs"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        try:
            query = tracker.latest_message.get('text')
            logger.info(f"Searching docs for: {query}")

            results = self.knowledge_base.search(query)
            logger.info(f"Found {len(results)} results")

            response = self.knowledge_base.format_response(results)
            logger.info(f"Response type: {response['type']}")

            if response['type'] == 'json':
                dispatcher.utter_message(json_message=response['content'])
            else:
                dispatcher.utter_message(text=response['content'])

        except Exception as e:
            logger.error(f"Error in action_search_docs: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while searching the documentation.")

        return []


# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
