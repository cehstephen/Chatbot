from actions.doc_scraper import DocumentScraper
import logging
import requests
from bs4 import BeautifulSoup

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def analyze_codeigniter_docs(url):
    logger.info(f"Analyzing {url}")

    try:
        response = requests.get(url, headers={'User-Agent': 'Documentation Bot'})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Analyze the page structure
        print("\nPage Analysis:")
        print(f"Title: {soup.title.string if soup.title else 'No title found'}")

        # Find navigation items (sidebar links)
        nav_items = soup.find_all('div', class_='toctree-wrapper')
        if nav_items:
            print("\nFound documentation sections:")
            for nav in nav_items:
                links = nav.find_all('a')
                for link in links:
                    print(f"- {link.text.strip()} ({link.get('href', 'no link')})")

        # Find main content area
        main_content = soup.find('div', class_='document')
        if main_content:
            print("\nFound main content area")
            sections = main_content.find_all(['h1', 'h2', 'h3', 'div', 'p'])
            print("\nContent structure:")
            for section in sections[:5]:  # Show first 5 sections
                print(f"- {section.name}: {section.text.strip()[:100]}...")

    except Exception as e:
        logger.error(f"Error analyzing {url}: {str(e)}")


def analyze_documentation_structure():
    """Analyze multiple documentation sources"""
    # Add URLs to analyze
    urls = [
        "https://www.codeigniter.com/userguide3/",
        # Add more URLs as needed
    ]

    for url in urls:
        print(f"\n{'=' * 50}")
        print(f"Analyzing: {url}")
        print('=' * 50)
        analyze_codeigniter_docs(url)


if __name__ == "__main__":
    analyze_documentation_structure()