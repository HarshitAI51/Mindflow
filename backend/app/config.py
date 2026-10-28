from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Models
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    nli_model: str = "cross-encoder/nli-deberta-v3-small"
    spacy_model: str = "en_core_web_sm"

    # Retrieval
    top_k_evidence: int = 5
    bm25_weight: float = 0.4
    semantic_weight: float = 0.6

    # Decision thresholds (will be calibrated later)
    supported_threshold: float = 0.70
    contradicted_threshold: float = 0.70
    abstain_margin: float = 0.15

    # Paths
    index_dir: str = "data/indexes"
    corpus_path: str = "data/processed/evidence_corpus.jsonl"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
