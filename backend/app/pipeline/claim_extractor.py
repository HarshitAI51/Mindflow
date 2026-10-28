import spacy
from typing import List


class ClaimExtractor:
    def __init__(self, model_name: str = "en_core_web_sm"):
        print(f"Loading spaCy model: {model_name}...")
        self.nlp = spacy.load(model_name)

    def extract_claims(self, text: str) -> List[str]:
        """Splits an input response text into atomic claim sentences."""
        text = text.strip()
        if not text:
            return []

        doc = self.nlp(text)
        claims = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 5]
        return claims


# Quick test run
if __name__ == "__main__":
    extractor = ClaimExtractor()
    sample = "U-Net was introduced in 2015. It was developed for glacier segmentation. Skip connections are used."
    claims = extractor.extract_claims(sample)
    print("Extracted claims:", claims)
