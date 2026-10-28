import json
import os
from datasets import load_dataset


def prepare_data():
    os.makedirs("data/processed", exist_ok=True)

    print("📥 Loading FEVER dataset sample from Hugging Face...")
    # Load first 5,000 samples for rapid development
    # FEVER ships an official HF loading script; datasets>=3 refuses to run it
    # unless we opt in explicitly.
    fever = load_dataset("fever", "v1.0", split="train[:5000]", trust_remote_code=True)

    evidence_docs = []
    seen = set()

    for item in fever:
        # Save Wikipedia text evidence snippets
        claim_text = item["claim"]
        label = item["label"]

        # Format corpus
        doc_id = str(item["id"])
        if doc_id not in seen:
            seen.add(doc_id)
            evidence_docs.append({
                "id": doc_id,
                "text": claim_text,
                "label": label
            })

    output_path = "data/processed/evidence_corpus.jsonl"
    print(f"💾 Saving {len(evidence_docs)} documents to {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        for doc in evidence_docs:
            f.write(json.dumps(doc) + "\n")

    print("✅ FEVER subset prepared successfully!")


if __name__ == "__main__":
    prepare_data()
