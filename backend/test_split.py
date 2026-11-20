import re
text = "today is really chill daay i have to watch one movie go for date go for shopping only enjoy"
triggers = ["i have to", "go for", "watch"]
pattern = "|".join([re.escape(t) for t in triggers])
parts = re.split(rf"\s+(?=\b(?:{pattern})\b)", text, flags=re.IGNORECASE)
print(f"Parts: {parts}")
