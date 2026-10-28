from transformers import pipeline
from typing import Dict, Any


class NLIVerifier:
    def __init__(self, model_name: str = "cross-encoder/nli-deberta-v3-small"):
        print(f"🤖 Loading local NLI Transformer model ({model_name})...")
        # Downloads model once to your local machine (~350MB)
        self.classifier = pipeline("text-classification", model=model_name)

    def verify_pair(self, claim: str, evidence: str) -> Dict[str, Any]:
        """
        Classifies relationship between claim & evidence passage:
        - ENTAILMENT    -> SUPPORTED
        - CONTRADICTION -> CONTRADICTED
        - NEUTRAL       -> INSUFFICIENT_EVIDENCE
        """
        # Order matters: the cross-encoder reads `text` as the premise and `text_pair`
        # as the hypothesis. The evidence is the premise, the claim is the hypothesis.
        # Swapping them collapses every pair to NEUTRAL (see notebooks/01_test_nli.ipynb).
        prediction = self.classifier({"text": evidence, "text_pair": claim})
        label_raw = prediction["label"].lower()
        score = float(prediction["score"])

        # Map cross-encoder labels to our schema
        if "entailment" in label_raw:
            verdict = "SUPPORTED"
        elif "contradiction" in label_raw:
            verdict = "CONTRADICTED"
        else:
            verdict = "INSUFFICIENT_EVIDENCE"

        return {
            "verdict": verdict,
            "confidence": round(score, 4),
            "raw_label": label_raw
        }


# Quick test run
if __name__ == "__main__":
    verifier = NLIVerifier()

    # Test 1: Supported
    res1 = verifier.verify_pair("U-Net was introduced in 2015.", "U-Net was published at MICCAI 2015.")
    print("\nTest 1 (Expected SUPPORTED):", res1)

    # Test 2: Contradicted
    res2 = verifier.verify_pair("U-Net was made for glacier segmentation.", "U-Net was designed for biomedical image segmentation.")
    print("Test 2 (Expected CONTRADICTED):", res2)
