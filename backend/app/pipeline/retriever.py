import json
import os
import pickle
import numpy as np
import faiss
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any


class HybridRetriever:
    def __init__(
        self,
        corpus_path: str = "data/processed/evidence_corpus.jsonl",
        index_dir: str = "data/indexes",
        embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):
        self.corpus_path = corpus_path
        self.index_dir = index_dir
        os.makedirs(index_dir, exist_ok=True)

        print(f"Loading embedding model: {embedding_model_name}...")
        self.encoder = SentenceTransformer(embedding_model_name)

        # Load corpus
        self.documents = []
        with open(corpus_path, "r", encoding="utf-8") as f:
            for line in f:
                self.documents.append(json.loads(line))

        print(f"Loaded {len(self.documents)} evidence documents.")

        # Build or Load Indexes
        self.bm25_path = os.path.join(index_dir, "bm25.pkl")
        self.faiss_path = os.path.join(index_dir, "faiss.index")

        if os.path.exists(self.bm25_path) and os.path.exists(self.faiss_path):
            self._load_indexes()
        else:
            self._build_indexes()

    def _build_indexes(self):
        print("⚙️ Building BM25 and FAISS indexes...")
        corpus_texts = [doc["text"] for doc in self.documents]

        # 1. BM25 Index
        tokenized_corpus = [doc.lower().split() for doc in corpus_texts]
        self.bm25 = BM25Okapi(tokenized_corpus)
        with open(self.bm25_path, "wb") as f:
            pickle.dump(self.bm25, f)

        # 2. FAISS Index
        embeddings = self.encoder.encode(corpus_texts, show_progress_bar=True, convert_to_numpy=True)
        # Normalize for cosine similarity
        faiss.normalize_L2(embeddings)
        dimension = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dimension)
        self.faiss_index.add(embeddings)
        faiss.write_index(self.faiss_index, self.faiss_path)

        print("✅ Indexes built and cached successfully!")

    def _load_indexes(self):
        print("⚡ Loading pre-built BM25 and FAISS indexes from cache...")
        with open(self.bm25_path, "rb") as f:
            self.bm25 = pickle.load(f)
        self.faiss_index = faiss.read_index(self.faiss_path)

    def search(self, query: str, top_k: int = 3, bm25_weight: float = 0.4, vector_weight: float = 0.6) -> List[Dict[str, Any]]:
        """Performs hybrid retrieval combining keyword matching and semantic vectors."""
        # BM25 Scores
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        if np.max(bm25_scores) > 0:
            bm25_scores = bm25_scores / np.max(bm25_scores)  # Normalize [0, 1]

        # Vector Scores
        query_vec = self.encoder.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        vector_scores, _ = self.faiss_index.search(query_vec, len(self.documents))
        vector_scores = vector_scores[0]
        # Clip negative similarities
        vector_scores = np.clip(vector_scores, 0, 1)

        # Hybrid Fusion Score
        hybrid_scores = (bm25_weight * bm25_scores) + (vector_weight * vector_scores)

        # Get top-k indices
        top_indices = np.argsort(hybrid_scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            doc = self.documents[idx].copy()
            doc["retrieval_score"] = float(round(hybrid_scores[idx], 4))
            results.append(doc)

        return results


# Quick test run
if __name__ == "__main__":
    retriever = HybridRetriever()
    query = "When was U-Net introduced?"
    results = retriever.search(query, top_k=2)
    print(f"\nQuery: '{query}'")
    for r in results:
        print(f" → [{r['retrieval_score']}] {r['text']} (Source: {r['title']})")
