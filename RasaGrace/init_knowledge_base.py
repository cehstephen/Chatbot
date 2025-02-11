import logging
import os
from actions.doc_scraper import DocumentScraper
from datetime import datetime

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraping.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def create_docs_directory():
    """Create docs directory if it doesn't exist"""
    if not os.path.exists('docs'):
        logger.info("Creating docs directory...")
        os.makedirs('docs')
        return True
    return False


def initialize_knowledge_base():
    """Initialize and update the knowledge base"""
    logger.info("Starting knowledge base initialization...")

    # Create docs directory if needed
    create_docs_directory()

    # Documentation sources configuration
    docs_config = {
        'urls': [
            'https://www.codeigniter.com/userguide3/',
            # Add more documentation URLs here
        ],
        'docs_path': 'docs'
    }

    try:
        # Initialize scraper
        logger.info("Initializing document scraper...")
        scraper = DocumentScraper(
            docs_path=docs_config['docs_path'],
            urls=docs_config['urls']
        )

        # Start scraping process
        logger.info("Starting documentation scraping...")
        start_time = datetime.now()

        # Scrape all documentation
        knowledge_base = scraper.scrape_all()

        # Log scraping results
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        logger.info(f"Scraping completed in {duration:.2f} seconds")
        logger.info(f"Total documents processed: {len(knowledge_base)}")

        # Save knowledge base
        logger.info("Saving knowledge base to file...")
        scraper.save_knowledge_base()

        # Log successful completion
        logger.info("Knowledge base initialization completed successfully")

        # Print summary
        print("\nScraping Summary:")
        print(f"Total documents: {len(knowledge_base)}")
        print(f"Time taken: {duration:.2f} seconds")
        print("Check scraping.log for detailed information")

    except Exception as e:
        logger.error(f"Error during knowledge base initialization: {str(e)}")
        raise


def main():
    """Main execution function"""
    try:
        print("Starting documentation scraping process...")
        initialize_knowledge_base()
        print("\nProcess completed successfully!")

    except Exception as e:
        print(f"\nError: {str(e)}")
        print("Check scraping.log for detailed error information")
        exit(1)


if __name__ == "__main__":
    main()