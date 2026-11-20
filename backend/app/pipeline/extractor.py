
import re
import datetime
from typing import List, Dict, Any, Optional

import spacy
from spacy.tokens import Span
import dateparser
from dateparser.search import search_dates


class DayForgeExtractor:
    # ---- small closed-class lexicons: grammar/function words, not task phrases ----
    CONTROL_LEMMAS = {"need", "have", "want", "plan", "try", "remember", "forget",
                      "promise", "hope", "decide", "go", "gotta", "wanna", "intend",
                      "ought", "suppose", "aim"}
    STATIVE = {"be", "seem", "feel", "look", "think", "know", "like", "love", "hate",
               "mean", "wish", "believe", "guess", "sound", "appear", "become",
               "exist", "happen", "matter", "cost"}
    VAGUE_OBJ = {"thing", "stuff", "something", "anything", "everything", "lot", "lots"}
    LEISURE_VAGUE = {"enjoy", "chill"}
    ABSTRACT_SUBJ = {"day", "today", "week", "weather", "time", "morning", "evening",
                     "night", "thing", "life"}
    EVENT_NOUNS = {"meeting", "appointment", "class", "lecture", "session", "dinner",
                   "lunch", "breakfast", "movie", "date", "concert", "show", "interview",
                   "call", "sync", "standup", "exam", "gym", "workout", "college",
                   "shopping", "trip", "dentist", "doctor"}
    DELIVERABLE_NOUNS = {"assignment", "report", "project", "homework", "abstract",
                         "slide", "presentation", "essay", "proposal", "invoice"}
    LIGHT_VERBS = {"have", "get", "take"}
    ATTEND_VERBS = {"attend", "meet", "join", "call", "visit"}
    DEADLINE_PREPS = {"by", "before", "until", "till"}
    TEMPORAL_PREPS = {"on", "at", "by", "before", "until", "till", "in", "around"}
    FILLERS = {"also", "plus", "so", "then", "firstly", "first", "next", "finally",
               "please", "just", "lol", "lmao", "btw", "asap", "urgently", "urgent",
               "anyway", "basically"}
    EDGE_WORDS = {",", ".", "!", "?", ":", ";", "-", "and", "or", "then", "also", "but"}
    HIGH_CUES = {"urgent", "urgently", "asap", "important", "critical", "crucial",
                 "emergency", "immediately", "must", "rush", "essential"}
    LOW_CUES = {"sometime", "whenever", "maybe", "eventually", "later", "optional",
                "someday", "unimportant", "calm", "flexible"}
    VAGUE_TIME = {"sometime", "whenever", "maybe", "later", "eventually", "someday", "soon"}
    DAYPART_HOUR = {"morning": 9, "afternoon": 15, "evening": 20, "night": 20,
                    "tonight": 20, "noon": 12, "midnight": 0}
    SLANG = {"tmrw": "tomorrow", "tmr": "tomorrow", "tomo": "tomorrow",
             "tonite": "tonight", "clg": "college", "cmplete": "complete",
             "daay": "day", "pls": "please", "plz": "please", "bcz": "because",
             "asap": "ASAP"}

    def __init__(self, model_name: str = "en_core_web_sm"):
        print(f"🧠 Loading spaCy model ({model_name})...")
        self.nlp = spacy.load(model_name)

  
    def _normalize(self, seg: str) -> str:
        """Light cleanup so the parser sees something close to its training data."""
        seg = re.sub(r"[A-Za-z']+", lambda m: self.SLANG.get(m.group(0).lower(), m.group(0)), seg)
        seg = re.sub(r"\bi\b", "I", seg)
        if seg and seg[0].islower():
            seg = seg[0].upper() + seg[1:]
        return seg


    @staticmethod
    def _negated(t) -> bool:
        if any(c.dep_ == "neg" or c.lower_ in {"no", "not", "non"} for c in t.children):
            return True
        doc = t.doc
        if t.i > 0 and doc[t.i - 1].lower_ in {"no", "not", "non"}:
            return True
        if t.i > 1 and doc[t.i - 1].lower_ == "-" and doc[t.i - 2].lower_ in {"non", "not"}:
            return True
        return False

    def _is_control(self, t) -> bool:
        """'need to X', 'have to X', 'going to X', 'don't forget to X' -> the real task is X."""
        return (t.pos_ in {"VERB", "AUX"} and t.lemma_.lower() in self.CONTROL_LEMMAS
                and any(c.dep_ in {"xcomp", "ccomp"} and c.pos_ == "VERB" for c in t.children))

    def _blocked_by_negated_control(self, t) -> bool:
        """'I don't need to call him' -> not a task. ('don't forget to' is the exception.)"""
        a = t
        while a.head.i != a.i:
            a = a.head
            if (self._is_control(a) and a.lemma_.lower() != "forget"
                    and any(c.dep_ == "neg" for c in a.children)):
                return True
        return False

    def _tense_ok(self, t) -> bool:
        if t.tag_ == "VBD":
            return False  # "I called mom" is history, not a task
        if t.tag_ == "VBN":
            if any(c.dep_ == "aux" and c.tag_ == "MD" for c in t.children):
                return True  # "should be printed"
            if t.dep_ == "xcomp":
                return True  # "needs to be submitted"
            if t.dep_ == "conj" and t.head.i != t.i:
                return self._tense_ok(t.head)
            return False  # "I have finished the report"
        return True

    @staticmethod
    def _subject_of(t):
        cur = t
        while True:
            for c in cur.children:
                if c.dep_ in {"nsubj", "nsubjpass"}:
                    return c
            if cur.dep_ in {"xcomp", "conj", "ccomp"} and cur.head.i != cur.i:
                cur = cur.head
            else:
                return None

    def _is_vague(self, t) -> bool:
        objs = [c for c in t.children if c.dep_ in {"dobj", "obj", "attr"}]
        has_prep = any(c.dep_ == "prep" for c in t.children)
        if any(o.lemma_.lower() in self.VAGUE_OBJ for o in objs) and not has_prep:
            return True  # "do many things"
        if t.lemma_.lower() in self.LEISURE_VAGUE and not objs and not has_prep:
            return True  # "will only enjoy"
        return False

    def _is_task_head(self, t) -> bool:
        if t.pos_ != "VERB":
            return False
        lem = t.lemma_.lower()
        if lem in self.STATIVE or self._is_control(t):
            return False
        if not self._tense_ok(t):
            return False
        if any(c.dep_ == "neg" for c in t.children):
            return False
        if self._blocked_by_negated_control(t):
            return False
        subj = self._subject_of(t)
        if subj is not None:
            if subj.pos_ == "NOUN" and subj.lemma_.lower() in self.ABSTRACT_SUBJ:
                return False  # "the day will start with ..."
            if subj.pos_ == "PRON" and subj.lower_ in {"it", "that", "this", "there"}:
                return False
        return not self._is_vague(t)

    @staticmethod
    def _owners(sent, head_idx: set) -> Dict[int, Optional[int]]:
        """Map each token -> nearest task head at/above it (None = sentence-level frame)."""
        owner: Dict[int, Optional[int]] = {}
        for t in sent:
            a = t
            while True:
                if a.i in head_idx:
                    owner[t.i] = a.i
                    break
                if a.head.i == a.i:
                    owner[t.i] = None
                    break
                a = a.head
        return owner

    CLOCK_RE = re.compile(r"\d{1,2}(?::\d{2})?\s*(?:am|pm)\b", re.I)
    TEMPORAL_GATE = re.compile(
        r"\d|today|tomorrow|tonight|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday",
        re.I)

    def _temporal_ents(self, sent, ref) -> list:
        """spaCy DATE/TIME entities + a dateparser safety net for spans the small NER misses."""
        doc = sent.doc
        prev_of = lambda e: doc[e.start - 1].lower_ if e.start > 0 else ""
        ents = [e for e in sent.ents if e.label_ in {"DATE", "TIME"} and prev_of(e) != "for"]

        # "dinner at 8" -> bare hour after "at" (NER calls it CARDINAL)
        for e in sent.ents:
            if e.label_ == "CARDINAL" and prev_of(e) == "at" and e.text.isdigit() and 1 <= int(e.text) <= 12:
                ents.append(doc.char_span(e.start_char, e.end_char, label="TIME"))

        taken = lambda a, b: any(not (b <= x.start_char or a >= x.end_char) for x in ents)
        try:
            found = search_dates(sent.text, languages=["en"],
                                 settings={"RELATIVE_BASE": ref, "PREFER_DATES_FROM": "future"}) or []
        except Exception:
            found = []
        for matched, _ in found:
            if not self.TEMPORAL_GATE.search(matched):  # blocks "may", "sat", "second"...
                continue
            idx = sent.text.find(matched)
            if idx < 0:
                continue
            a0 = sent.start_char + idx
            if taken(a0, a0 + len(matched)):
                continue
            pieces = []
            m = self.CLOCK_RE.search(matched)
            if m:
                pieces.append((a0 + m.start(), a0 + m.end(), "TIME"))
                pre = re.sub(r"\s*(?:at|by|on|@)?\s*$", "", matched[:m.start()], flags=re.I)
                post = matched[m.end():].strip()
                if pre.strip():
                    pieces.append((a0, a0 + len(pre), "DATE"))
                if post and self.TEMPORAL_GATE.search(post):
                    pieces.append((a0 + m.end() + matched[m.end():].index(post), a0 + m.end() + matched[m.end():].index(post) + len(post), "DATE"))
            else:
                pieces.append((a0, a0 + len(matched), "DATE"))
            for a, b, label in pieces:
                span = doc.char_span(a, b, label=label, alignment_mode="expand")
                if span is not None and not taken(span.start_char, span.end_char):
                    ents.append(span)
        for t in sent:
            if t.lower_ == "weekend" and not taken(t.idx, t.idx + len(t)):
                a = t.i - 1 if t.i > 0 and doc[t.i - 1].lower_ in {"this", "next", "the"} else t.i
                ents.append(Span(doc, a, t.i + 1, label="DATE"))
        trimmed = []
        junk = self.TEMPORAL_PREPS | {"and", "or", "then", "also", "from", "next to"}
        for e in ents:
            a, b = e.start, e.end
            while a < b and doc[a].lower_ in junk and not doc[a].like_num:
                a += 1
            while a < b and doc[b - 1].lower_ in junk:
                b -= 1
            if a < b:
                trimmed.append(Span(doc, a, b, label=e.label_))
        return sorted(trimmed, key=lambda e: e.start)

    def _resolve_datetime(self, date_ents, time_ents, scope_tokens,
                          ref: datetime.datetime, ctx_dates: List[str]) -> Dict[str, Any]:
        settings = {"RELATIVE_BASE": ref, "PREFER_DATES_FROM": "future",
                    "RETURN_AS_TIMEZONE_AWARE": False}
        vague = any(t.lower_ in self.VAGUE_TIME for t in scope_tokens)
        date_texts = [e.text for e in date_ents] or ([] if vague else list(ctx_dates))
        time_texts = [e.text for e in time_ents]

        daypart_hour = None
        for t in scope_tokens:
            if t.lower_ in self.DAYPART_HOUR:
                daypart_hour = self.DAYPART_HOUR[t.lower_]
                if t.lower_ == "tonight" and not date_texts:
                    date_texts = ["today"]

        # --- date part ---
        words = [w for w in " ".join(date_texts).split() if w.lower() not in self.DAYPART_HOUR]
        dtxt = " ".join(words).strip()
        date_part = None
        if "weekend" in dtxt.lower():
            date_part = (ref + datetime.timedelta(days=(5 - ref.weekday()) % 7)).replace(hour=0, minute=0)
        elif dtxt:
            date_part = dateparser.parse(dtxt, settings=settings)

        # --- clock part ---
        clock = None
        full_dt = None
        for tt in time_texts:
            if tt.lower().startswith("in "):  # "in 2 hours"
                full_dt = dateparser.parse(tt, settings=settings)
            elif tt.strip().isdigit():  # bare "at 8": guess am/pm from context
                h = int(tt)
                pm_ctx = any(t.lower_ in {"dinner", "tonight", "evening", "night", "movie"} for t in scope_tokens)
                clock = ((h % 12) + 12 if (h <= 6 or pm_ctx) else h, 0)
            elif re.search(r"\d|noon|midnight", tt.lower()):
                p = dateparser.parse(tt, settings=settings)
                if p:
                    clock = (p.hour, p.minute)
                    if date_part is None and p.date() != ref.date():  # NER gave "3pm tomorrow" as one TIME
                        date_part = p

        parsed = None
        has_time = False
        if full_dt:
            parsed, has_time = full_dt, True
        elif date_part or clock or daypart_hour is not None:
            base = date_part.date() if date_part else ref.date()
            if clock:
                parsed, has_time = datetime.datetime.combine(base, datetime.time(*clock)), True
                if not date_part and parsed < ref:
                    parsed += datetime.timedelta(days=1)
            elif daypart_hour is not None:
                parsed, has_time = datetime.datetime.combine(base, datetime.time(daypart_hour, 0)), True
            else:
                parsed = datetime.datetime.combine(base, datetime.time(23, 59))
            if parsed.date() < ref.date():  # resolved into the past -> don't trust it
                parsed, has_time = None, False

        date_display = "No deadline"
        if parsed:
            low = dtxt.lower()
            date_display = low.capitalize() if low in {"today", "tomorrow"} else parsed.strftime("%d %B")
        elif date_texts:
            date_display = " ".join(date_texts).capitalize()

        return {
            "datetime": parsed.strftime("%Y-%m-%d %H:%M") if parsed else "FLEXIBLE",
            "date_display": date_display,
            "time_display": parsed.strftime("%I:%M %p").lstrip("0") if (parsed and has_time) else "None",
            "has_time": bool(parsed and has_time),
            "explicit_clock": bool(parsed and (clock or full_dt)),
            "_dt": parsed,
        }

   
    def _priority(self, tokens) -> str:
        high = low = False
        for t in tokens:
            lem, low_t = t.lemma_.lower(), t.lower_
            if lem == "priority":
                mods = {c.lower_ for c in t.children}
                if mods & {"low"}:
                    low = True
                elif mods & {"high", "top"}:
                    high = True
                continue
            if lem in self.HIGH_CUES or low_t in self.HIGH_CUES:
                if self._negated(t):
                    low = True  # "not urgent", "no rush"
                else:
                    high = True
            elif lem in self.LOW_CUES or low_t in self.LOW_CUES:
                if not self._negated(t):
                    low = True
        if low:
            return "LOW"
        return "HIGH" if high else "MEDIUM"

    def _classify_type(self, tokens, ents, head, resolved: bool, explicit_clock: bool) -> str:
        doc = head.doc
        if any(t.lower_ in {"due", "deadline"} for t in tokens):
            return "DEADLINE"
        event_noun = any(t.pos_ == "NOUN" and t.lemma_.lower() in self.EVENT_NOUNS for t in tokens) \
            or head.lemma_.lower() in self.EVENT_NOUNS
        by_cue = any(e.start > 0 and doc[e.start - 1].lower_ in self.DEADLINE_PREPS for e in ents)
        if by_cue and not event_noun:
            return "DEADLINE"
        if (event_noun and resolved) or (explicit_clock and head.lemma_.lower() in self.ATTEND_VERBS):
            return "APPOINTMENT"
        return "TASK"


    def _build_title(self, sent, head, owner, removed: set) -> str:
        toks = [t for t in sent if owner.get(t.i) == head.i]

        passive_subj = None
        if head.tag_ == "VBN":
            s = self._subject_of(head)
            if s is not None and s.pos_ in {"NOUN", "PROPN"} and owner.get(s.i) in (None, head.i):
                passive_subj = s

        light = head.lemma_.lower() in self.LIGHT_VERBS and any(
            c.dep_ in {"dobj", "obj"} and c.lemma_.lower() in (self.EVENT_NOUNS | self.DELIVERABLE_NOUNS)
            for c in head.children)
        light_obj = {c.i for c in head.children if c.dep_ in {"dobj", "obj"}}

        cue_words = self.HIGH_CUES | self.LOW_CUES | self.VAGUE_TIME
        for t in toks:
            if t.lemma_.lower() in cue_words or t.lower_ in cue_words:
                removed.add(t.i)
                removed.update(c.i for c in t.children if c.lower_ in {"no", "not", "non"})
        parts: List[str] = []
        if passive_subj is not None:  # "report needs to be submitted" -> "Submit report"
            parts.append(head.lemma_)
            parts += [t.text for t in passive_subj.subtree if t.dep_ != "det" and t.i not in removed]

        for t in toks:
            if t.i in removed:
                continue
            if t.dep_ in {"aux", "auxpass"} or t.lower_ in self.FILLERS:
                continue
            if t.dep_ == "nsubj" and t.lower_ in {"i", "we", "you"}:
                continue
            if t.lower_ == "due":
                continue
            if passive_subj is not None and (t.i == head.i or t.i in {x.i for x in passive_subj.subtree}):
                continue
            if light and (t.i == head.i or (t.dep_ == "det" and t.head.i in light_obj)):
                continue
            if not any(ch.isalnum() for ch in t.text) and not t.is_punct:
                continue  # emoji / symbols
            parts.append(t.text)

        while parts and parts[0].lower() in self.EDGE_WORDS:
            parts.pop(0)
        while parts and parts[-1].lower() in (self.EDGE_WORDS | self.TEMPORAL_PREPS | {"for"}):
            parts.pop()

        title = " ".join(parts)
        title = re.sub(r"\s+([,.!?;:])", r"\1", title)
        title = re.sub(r"\s+(['’]s)\b", r"\1", title).strip()
        return (title[0].upper() + title[1:]) if title else ""


    def _extract_from_sentence(self, sent, ref, ctx) -> List[Dict[str, Any]]:
        ents = self._temporal_ents(sent, ref)
        heads = [t for t in sent if self._is_task_head(t)]
        head_idx = {t.i for t in heads}
        owner = self._owners(sent, head_idx)

        # Event / deliverable nouns with no verb ("Dentist at 5pm", "Assignment due Friday")
        due_cue = any(t.lower_ in {"due", "deadline"} for t in sent)
        cand = [t for t in sent if t.pos_ in {"NOUN", "PROPN"} and (
            (owner.get(t.i) is None and (t.lemma_.lower() in self.EVENT_NOUNS
                                         or (due_cue and t.lemma_.lower() in self.DELIVERABLE_NOUNS)))
            or (t.dep_ in {"conj", "appos"} and t.lemma_.lower() in self.EVENT_NOUNS
                and t.head.lemma_.lower() in self.EVENT_NOUNS))]
        cand_idx = {t.i for t in cand}
        cand = [t for t in cand if t.dep_ in {"conj", "appos"} or not any(a.i in cand_idx for a in t.ancestors)]
        if cand:
            heads += cand
            head_idx |= {t.i for t in cand}
            owner = self._owners(sent, head_idx)

        # Fallback: short timed fragment with no verb ("Dentist 5pm tomorrow")
        if not heads:
            short_timed = len(sent) <= 10 and any(
                e.label_ == "TIME" and any(ch.isdigit() for ch in e.text) for e in ents)
            has_neg = any(t.dep_ == "neg" for t in sent)
            stative_root = sent.root.lemma_.lower() in self.STATIVE and not short_timed
            if short_timed and not has_neg and not stative_root:
                heads = [sent.root]
                head_idx = {sent.root.i}
                owner = {t.i: sent.root.i for t in sent}

        if not heads:
            return []

        removed = set()
        for e in ents:
            for t in e:
                removed.add(t.i)
            if e.start > 0 and sent.doc[e.start - 1].lower_ in self.TEMPORAL_PREPS:
                removed.add(e.start - 1)
        for t in sent:  # "tomorrow's" -> drop the 's too
            if t.dep_ == "case" and t.head.i in removed:
                removed.add(t.i)

        ent_owner = {id(e): owner.get(e.root.i) for e in ents}
        for e in ents:
            if e.label_ == "TIME" and ent_owner[id(e)] is None and heads:
                nearest = min(heads, key=lambda hh: abs(hh.i - e.start))
                ent_owner[id(e)] = nearest.i
        for e in ents:  # "3pm tomorrow": loose adverbial follows its prepositional partner
            for o in ents:
                if o is not e and o.label_ != e.label_ and (abs(o.start - e.end) <= 1 or abs(e.start - o.end) <= 1):
                    if o.label_ == "TIME":
                        ent_owner[id(e)] = owner.get(o.root.i)
        frame = [t for t in sent if owner.get(t.i) is None]
        shared = [e for e in ents if ent_owner[id(e)] is None]
        results = []

        for h in sorted(heads, key=lambda x: x.i):
            own_toks = [t for t in sent if owner.get(t.i) == h.i]
            own = [e for e in ents if ent_owner[id(e)] == h.i]
            pick = lambda label: ([e for e in own if e.label_ == label]
                                  or [e for e in shared if e.label_ == label])
            date_ents, time_ents = pick("DATE"), pick("TIME")
            scope = own_toks + frame

            title = self._build_title(sent, h, owner, removed)
            if len(title) < 3:
                continue

            dt = self._resolve_datetime(date_ents, time_ents, scope, ref, ctx["dates"])
            ttype = self._classify_type(scope, date_ents + time_ents, h, dt["_dt"] is not None, dt["explicit_clock"])
            prio = self._priority(scope)
            if prio == "MEDIUM" and ctx["priority"]:
                prio = ctx["priority"]
            if (prio == "MEDIUM" and ttype == "DEADLINE" and dt["_dt"]
                    and dt["_dt"] - ref <= datetime.timedelta(hours=24)):
                prio = "HIGH"

            results.append({
                "task": title,
                "datetime": dt["datetime"],
                "date_display": dt["date_display"],
                "time_display": dt["time_display"],
                "has_time": dt["has_time"],
                "is_ambiguous": any(t.lower_ in self.VAGUE_TIME for t in scope),
                "type": ttype,
                "priority": prio,
                "source": sent.text.strip(),
            })
        return results

    def parse_braindump(self, text: str, ref_date_str: str = None) -> List[Dict[str, Any]]:
        try:
            ref = datetime.datetime.strptime(ref_date_str, "%Y-%m-%d %H:%M") if ref_date_str \
                else datetime.datetime.now()
        except Exception:
            ref = datetime.datetime.now()

        ctx = {"dates": [], "priority": None}  # carries "Tomorrow is busy." / "URGENT!" forward
        tasks: List[Dict[str, Any]] = []
        segments = [s.strip(" \t-•*") for s in re.split(r"[\n;]+", text)]

        for seg in filter(None, segments):
            doc = self.nlp(self._normalize(seg))
            for sent in doc.sents:
                found = self._extract_from_sentence(sent, ref, ctx)
                if (not found and len(sent) <= 12 and sent[0].pos_ in {"NOUN", "PROPN", "VERB"}
                        and sum(t.is_alpha for t in sent) >= 2
                        and not any(t.pos_ in {"VERB", "AUX"} for t in sent)):
                    t0 = sent.text.strip()
                    redo = self.nlp("I need to " + t0[0].lower() + t0[1:])
                    for s2 in redo.sents:
                        found += self._extract_from_sentence(s2, ref, ctx)
                if found:
                    ctx["priority"] = None
                    tasks.extend(found)
                    continue
                # No task here: maybe it set context for the next sentences
                ents = self._temporal_ents(sent, ref)
                if any(e.label_ == "DATE" for e in ents):
                    ctx["dates"] = [e.text for e in ents if e.label_ == "DATE"]
                if len(sent) <= 4:
                    p = self._priority(list(sent))
                    if p != "MEDIUM":
                        ctx["priority"] = p

        seen, unique = set(), []
        for t in tasks:
            key = t["task"].lower()
            if key in seen:
                continue
            seen.add(key)
            t["id"] = f"task_{len(unique) + 1}"
            unique.append(t)
        return unique

    def build_day_summary(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not tasks:
            return {"intensity": "LIGHT", "score": 0, "high_priority_count": 0,
                    "deadline_count": 0, "appointment_count": 0, "total_tasks": 0,
                    "message": "No actionable tasks detected — clean mind, easy day."}

        high = sum(1 for t in tasks if t["priority"] == "HIGH")
        deadlines = sum(1 for t in tasks if t["type"] == "DEADLINE")
        appointments = sum(1 for t in tasks if t["type"] == "APPOINTMENT")
        total = len(tasks)
        score = (high * 3) + (deadlines * 2) + (appointments * 2) + total

        if score >= 12 or high >= 2:
            intensity, message = "HECTIC", "Heavy load — focus on high-priority deadlines first."
        elif score >= 6:
            intensity, message = "BUSY", "Solid day — keep momentum and protect your focus blocks."
        elif score >= 3:
            intensity, message = "NORMAL", "Manageable day — a steady pace will clear everything."
        else:
            intensity, message = "LIGHT", "Light day — great opportunity for deep, thoughtful work."

        return {"intensity": intensity, "score": score, "high_priority_count": high,
                "deadline_count": deadlines, "appointment_count": appointments,
                "total_tasks": total, "message": message}


if __name__ == "__main__":
    ex = DayForgeExtractor()
    dump = ("URGENT! I need to submit the abstract by 5 November 11:59pm and also call the dentist tomorrow at 4pm. "
            "Today is really chill day, I will only enjoy. Don't forget to buy milk and eggs. "
            "Not urgent but I should clean my room sometime. Gym at 6pm, then dinner with Ravi at 8. "
            "I don't need to email Priya. The report should be printed before Friday.")
    for t in ex.parse_braindump(dump, "2026-11-04 10:00"):
        print(t)
    print(ex.build_day_summary(ex.parse_braindump(dump, "2026-11-04 10:00")))