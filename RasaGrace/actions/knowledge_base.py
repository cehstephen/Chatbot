import json
import numpy as np
from typing import List, Dict, Any
from pathlib import Path
from datetime import datetime
from scipy.spatial.distance import cosine
from sklearn.feature_extraction.text import TfidfVectorizer


class KnowledgeBase:
    def __init__(self, file_path: str = 'knowledge_base.json'):
        self.file_path = file_path
        self.knowledge_base = {}
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.vectors = None
        self.documents = []  # Store documents for reference
        self.load_knowledge_base()

    def load_knowledge_base(self):
        """Load the knowledge base from file"""
        if Path(self.file_path).exists():
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.knowledge_base = json.load(f)
                self._update_vectors()

    def _update_vectors(self):
        """Update TF-IDF vectors for content matching"""
        if not self.knowledge_base:
            return

        # Prepare documents for vectorization
        self.documents = []
        for doc_id, entry in self.knowledge_base.items():
            # Handle both string and dictionary content
            if isinstance(entry['content'], str):
                self.documents.append(entry['content'])
            elif isinstance(entry['content'], dict):
                # For JSON content, convert to string
                self.documents.append(json.dumps(entry['content']))

        if self.documents:
            self.vectors = self.vectorizer.fit_transform(self.documents)

    def search(self, query: str, threshold: float = 0.3) -> List[Dict[str, Any]]:
        """Search the knowledge base for relevant content"""
        if not self.vectors is not None or not self.documents:
            return []

        # Transform query
        query_vector = self.vectorizer.transform([query])

        # Calculate similarities
        similarities = []
        for i in range(self.vectors.shape[0]):
            similarity = 1 - cosine(
                query_vector.toarray().flatten(),
                self.vectors[i].toarray().flatten()
            )
            similarities.append(similarity)

        # Get results above threshold
        results = []
        doc_ids = list(self.knowledge_base.keys())

        for idx, score in enumerate(similarities):
            if score > threshold:
                doc_id = doc_ids[idx]
                doc = self.knowledge_base[doc_id]
                results.append({
                    'score': float(score),  # Convert numpy float to native float
                    'doc_id': doc_id,
                    'title': doc.get('title', ''),
                    'content': doc['content'],
                    'metadata': doc.get('metadata', {}),
                    'code_blocks': doc.get('code_blocks', [])
                })

        return sorted(results, key=lambda x: x['score'], reverse=True)

    def format_response(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format search results for response"""
        if not results:
            return {
                'type': 'text',
                'content': "I couldn't find any relevant information for your query."
            }

        best_match = results[0]

        # Check if the content is JSON
        if isinstance(best_match['content'], dict):
            return {
                'type': 'json',
                'content': best_match['content']
            }

        # Check if there are code blocks
        if best_match.get('code_blocks'):
            response = f"{best_match['title']}\n\n"
            for block in best_match['code_blocks']:
                response += f"```{block.get('language', '')}\n{block['content']}\n```\n\n"
            return {
                'type': 'text',
                'content': response.strip()
            }

        # Regular text response
        return {
            'type': 'text',
            'content': str(best_match['content'])  # Ensure content is string
        }