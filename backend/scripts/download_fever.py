import json
import os
import wikipediaapi
from datasets import load_dataset
from tqdm import tqdm


def prepare_real_evidence_corpus():
    os.makedirs("data/processed", exist_ok=True)

    print("📥 Loading FEVER train subset from Hugging Face...")
    fever = load_dataset("fever", "v1.0", split="train[:5000]", trust_remote_code=True)

    # Collect unique Wikipedia article titles from evidence annotations
    wiki_titles = set()
    for item in fever:
        wiki_url = item.get("evidence_wiki_url")
        if wiki_url and wiki_url.strip():
            # FEVER formats URLs like "Nikolaj_Coster-Waldau" -> "Nikolaj Coster-Waldau"
            clean_title = wiki_url.replace("_", " ")
            wiki_titles.add(clean_title)

    print(f"🔍 Found {len(wiki_titles)} unique Wikipedia evidence articles referenced.")

    # Initialize Wikipedia API with a standard User-Agent header (required by Wikimedia)
    wiki = wikipediaapi.Wikipedia(
        user_agent="TruthLens/1.0 (college_nlp_project@example.com)",
        language="en"
    )

    evidence_docs = []
    doc_id = 0

    print("🌐 Fetching real Wikipedia article passages...")
    for title in tqdm(list(wiki_titles)[:500]):  # Top 500 articles = ~2500-4000 evidence sentences
        page = wiki.page(title)
        if page.exists():
            # Split summary text into clean sentences
            sentences = [s.strip() for s in page.summary.split(". ") if len(s.strip()) > 15]
            for sent_idx, sent in enumerate(sentences):
                doc_id += 1
                evidence_docs.append({
                    "id": f"wiki_{doc_id}",
                    "title": title,
                    "text": sent if sent.endswith(".") else sent + ".",
                    "source": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                })

    output_path = "data/processed/evidence_corpus.jsonl"
    print(f"💾 Saving {len(evidence_docs)} real evidence passages to {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        for doc in evidence_docs:
            f.write(json.dumps(doc) + "\n")

    print("✅ Real evidence corpus prepared successfully!")


if __name__ == "__main__":
    prepare_real_evidence_corpus()
