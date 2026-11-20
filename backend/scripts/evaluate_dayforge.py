import json
from app.pipeline.extractor import DayForgeExtractor


def run_evaluation():
    extractor = DayForgeExtractor()
    with open("data/braindump_dataset.json", "r", encoding="utf-8") as f:
        dataset = json.load(f)

    total_gold_tasks = 0
    total_extracted_tasks = 0
    correct_priorities = 0
    correct_types = 0

    for ex in dataset:
        input_text = ex["input"]
        gold_tasks = ex["output"]
        total_gold_tasks += len(gold_tasks)

        predictions = extractor.parse_braindump(input_text, ref_date_str="2026-10-29 09:00")
        total_extracted_tasks += len(predictions)

        # Simple overlap metric matching
        for pred in predictions:
            for gold in gold_tasks:
                if any(word in gold["task"].lower() for word in pred["task"].lower().split()[:2]):
                    if pred["priority"] == gold["priority"]:
                        correct_priorities += 1
                    if pred["type"] == gold["type"]:
                        correct_types += 1
                    break

    recall = (total_extracted_tasks / total_gold_tasks) * 100
    priority_acc = (correct_priorities / max(total_extracted_tasks, 1)) * 100
    type_acc = (correct_types / max(total_extracted_tasks, 1)) * 100

    print("\n📊 DayForge Evaluation Benchmark Results")
    print("=" * 42)
    print(f"Total Test Examples        : {len(dataset)}")
    print(f"Total Gold Tasks           : {total_gold_tasks}")
    print(f"Extracted Tasks Count      : {total_extracted_tasks}")
    print(f"Task Extraction Recall     : {recall:.1f}%")
    print(f"Priority Classification Acc: {priority_acc:.1f}%")
    print(f"Task Type Classification Acc: {type_acc:.1f}%")
    print("=" * 42)


if __name__ == "__main__":
    run_evaluation()
