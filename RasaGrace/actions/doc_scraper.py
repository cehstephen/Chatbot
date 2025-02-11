# File: actions/doc_scraper.py
import os
import json
import hashlib
import requests
import markdown
import frontmatter
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from datetime import datetime
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class DocumentScraper:
    def __init__(self, docs_path: str = None, urls: List[str] = None):
        self.docs_path = docs_path or "docs"
        self.urls = urls or []
        self.knowledge_base = {}
        logger.info(f"Initialized DocumentScraper with urls: {self.urls}")

    def scrape_all(self) -> Dict:
        """Scrape both local and web documentation"""
        logger.info("Starting scrape_all")
        try:
            self.scrape_web_docs()
            if os.path.exists(self.docs_path):
                self.scrape_local_docs()
            logger.info(f"Scraping completed. Found {len(self.knowledge_base)} documents")
            return self.knowledge_base
        except Exception as e:
            logger.error(f"Error in scrape_all: {str(e)}")
            raise

    def scrape_local_docs(self):
        """Scrape local documentation files"""
        logger.info(f"Starting local docs scraping from {self.docs_path}")
        try:
            for root, _, files in os.walk(self.docs_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    logger.info(f"Processing local file: {file_path}")

                    try:
                        # Process based on file extension
                        _, ext = os.path.splitext(file_path)
                        if ext.lower() == '.md':
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = self.process_markdown(f.read())
                        elif ext.lower() == '.json':
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = {
                                    'title': os.path.basename(file_path),
                                    'content': json.load(f),
                                    'type': 'json'
                                }
                        else:
                            # Skip unsupported file types
                            logger.info(f"Skipping unsupported file type: {file_path}")
                            continue

                        self.knowledge_base[file_path] = {
                            'source': 'local',
                            'path': file_path,
                            'last_updated': datetime.now().isoformat(),
                            **content
                        }
                        logger.info(f"Successfully processed {file_path}")

                    except Exception as e:
                        logger.error(f"Error processing local file {file_path}: {str(e)}")

        except Exception as e:
            logger.error(f"Error in scrape_local_docs: {str(e)}")

    def process_markdown(self, content: str) -> Dict:
        """Process markdown content and extract metadata"""
        try:
            post = frontmatter.loads(content)
            html = markdown.markdown(post.content)
            soup = BeautifulSoup(html, 'html.parser')

            # Extract code blocks
            code_blocks = []
            for pre in soup.find_all('pre'):
                code = pre.find('code')
                if code:
                    lang = code.get('class', [''])[0].replace('language-', '') if code.get('class') else None
                    code_blocks.append({
                        'language': lang,
                        'content': code.get_text()
                    })

            return {
                'title': post.metadata.get('title', ''),
                'content': soup.get_text(),
                'metadata': post.metadata,
                'code_blocks': code_blocks
            }
        except Exception as e:
            logger.error(f"Error processing markdown: {str(e)}")
            raise

    def scrape_web_docs(self):
        """Scrape web-based documentation"""
        logger.info("Starting web docs scraping")

        for url in self.urls:
            logger.info(f"Processing URL: {url}")
            try:
                response = requests.get(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                response.raise_for_status()
                logger.info(f"Successfully fetched {url}")

                soup = BeautifulSoup(response.text, 'html.parser')

                # For CodeIgniter docs
                if 'codeigniter.com' in url:
                    nav_items = soup.find_all('div', class_='toctree-wrapper')
                    if nav_items:
                        logger.info(f"Found {len(nav_items)} navigation sections")
                        for nav in nav_items:
                            links = nav.find_all('a')
                            logger.info(f"Found {len(links)} links in navigation")

                            for link in links:
                                href = link.get('href')
                                if href:
                                    # Construct full URL
                                    if not href.startswith('http'):
                                        if href.startswith('/'):
                                            href = f"https://www.codeigniter.com{href}"
                                        else:
                                            base_url = url.rstrip('/')
                                            href = f"{base_url}/{href}"

                                    logger.info(f"Processing sub-page: {href}")
                                    try:
                                        sub_response = requests.get(href)
                                        sub_response.raise_for_status()
                                        sub_soup = BeautifulSoup(sub_response.text, 'html.parser')

                                        # Get main content
                                        content_div = sub_soup.find('div', class_='document')
                                        if content_div:
                                            # Extract code blocks
                                            code_blocks = []
                                            for pre in content_div.find_all('pre'):
                                                code_blocks.append({
                                                    'language': 'php',
                                                    'content': pre.get_text()
                                                })

                                            # Store in knowledge base
                                            self.knowledge_base[href] = {
                                                'title': link.text.strip(),
                                                'content': content_div.get_text(),
                                                'code_blocks': code_blocks,
                                                'url': href,
                                                'last_updated': datetime.now().isoformat()
                                            }
                                            logger.info(f"Successfully added {href} to knowledge base")
                                    except Exception as e:
                                        logger.error(f"Error processing sub-page {href}: {str(e)}")
                    else:
                        logger.warning("No navigation sections found")

            except Exception as e:
                logger.error(f"Error processing {url}: {str(e)}")

    def save_knowledge_base(self, file_path: str = 'knowledge_base.json'):
        """Save the knowledge base to a JSON file"""
        logger.info(f"Saving knowledge base with {len(self.knowledge_base)} documents")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.knowledge_base, f, ensure_ascii=False, indent=2)
            logger.info(f"Successfully saved knowledge base to {file_path}")
        except Exception as e:
            logger.error(f"Error saving knowledge base: {str(e)}")
            raise