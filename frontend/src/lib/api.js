// src/lib/api.js

const ENDPOINTS = [
  "/api/parse",
  "http://127.0.0.1:8001/api/parse",
  "http://localhost:8001/api/parse",
  "http://127.0.0.1:8000/api/parse",
  "http://localhost:8000/api/parse",
];

export async function extractTasksWithAI(inputText) {
  // 1. Try remote API endpoints with a fast timeout
  for (const url of ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          reference_date: new Date().toISOString().slice(0, 16).replace("T", " "),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log("Connected to AI Backend:", url, data);

        let tasks = [];
        if (Array.isArray(data)) {
          tasks = data;
        } else if (Array.isArray(data.tasks)) {
          tasks = data.tasks;
        } else if (Array.isArray(data.parsed_tasks)) {
          tasks = data.parsed_tasks;
        } else if (Array.isArray(data.items)) {
          tasks = data.items;
        }

        return {
          tasks,
          day_summary: data.day_summary || null,
          source: "backend",
          endpoint: url,
        };
      }
    } catch (e) {
      // Continue to next endpoint
    }
  }

  // 2. Intelligent Client-Side NLP Engine if backend is not currently running
  console.warn("Backend NLP server not currently running. Using client-side NLP engine.");
  return extractTasksLocally(inputText);
}

function extractTasksLocally(inputText) {
  if (!inputText || !inputText.trim()) {
    return { tasks: [], day_summary: null, source: "local_engine" };
  }

  // Split thoughts on sentence terminators and lookahead connectors
  const rawSentences = inputText.split(/(?<=[.!?;\n])\s+/);
  const clauses = [];
  const triggers = [
    "before that,", "before that", "and also", ", also", "also",
    "and then", "then", "plus", "finally", "remember to", "don't forget to"
  ];
  const triggerRegex = new RegExp(`\\s+(?=\\b(?:${triggers.join("|")})\\b)`, "i");

  for (const sent of rawSentences) {
    const s = sent.trim();
    if (!s) continue;
    const parts = s.split(triggerRegex);
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed.length > 3) clauses.push(trimmed);
    }
  }

  const tasks = [];
  let taskCount = 0;

  for (const clause of clauses) {
    const lower = clause.toLowerCase();

    // Skip conversational noise
    if (/^(today is (really )?chill|only enjoy|just enjoy|so chaotic|lol|lmao)/i.test(lower)) {
      continue;
    }

    taskCount += 1;

    // Detect Type
    let type = "TASK";
    if (/\b(due|deadline|by\s+\d|before\s+\d|submit|submission|abstract)\b/i.test(lower)) {
      type = "DEADLINE";
    } else if (/\b(meeting|appointment|review meeting|class|session|sync|call|dentist|doctor)\b/i.test(lower)) {
      type = "APPOINTMENT";
    }

    // Detect Priority
    let priority = "MEDIUM";
    if (/\b(urgent|asap|important|critical|no late|high priority|submit)\b/i.test(lower)) {
      priority = "HIGH";
    } else if (/\b(sometime|whenever|maybe|eventually|later)\b/i.test(lower)) {
      priority = "LOW";
    }

    // Detect Time
    let timeDisplay = "None";
    const timeMatch = clause.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
    if (timeMatch) {
      timeDisplay = timeMatch[1].toUpperCase();
    }

    // Detect Date
    let dateDisplay = "No deadline";
    const dateMatch = clause.match(/\b(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}|today|tomorrow|tonight|this weekend|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dateMatch) {
      dateDisplay = dateMatch[1].charAt(0).toUpperCase() + dateMatch[1].slice(1);
    }

    // Clean Task Title
    let cleaned = clause;
    const prefixes = [
      "we need to", "i need to", "need to", "we must", "i must", "must",
      "we have to", "i have to", "have to", "before that,", "before that",
      "remember to", "don't forget to", "please", "just", "also", "plus", "so"
    ];
    for (const pref of prefixes) {
      cleaned = cleaned.replace(new RegExp(`^\\s*${pref}\\s*`, "i"), "");
    }

    // Strip trailing temporal phrases from title for crispness
    cleaned = cleaned.replace(/\s+on\s+\d{1,2}\s+[a-zA-Z]+\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm).*$/i, "");
    cleaned = cleaned.replace(/\s+by\s+\d{1,2}\s+[a-zA-Z]+\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm).*$/i, "");
    cleaned = cleaned.replace(/\s+tomorrow\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm).*$/i, "");
    cleaned = cleaned.replace(/\s+by\s+(?:friday|monday|sunday|saturday|thursday|wednesday|tuesday)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm).*$/i, "");
    cleaned = cleaned.replace(/[.\s,]+$/, "");

    if (cleaned.length > 2) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    tasks.push({
      id: `task_${taskCount}`,
      task: cleaned || clause,
      type,
      priority,
      date_display: dateDisplay,
      time_display: timeDisplay,
      is_ambiguous: /\b(sometime|maybe|later)\b/i.test(lower),
      datetime: "FLEXIBLE",
    });
  }

  // Calculate day summary
  const highCount = tasks.filter((t) => t.priority === "HIGH").length;
  const deadlineCount = tasks.filter((t) => t.type === "DEADLINE").length;
  const appointmentCount = tasks.filter((t) => t.type === "APPOINTMENT").length;
  const total = tasks.length;
  const score = highCount * 3 + deadlineCount * 2 + appointmentCount * 2 + total;

  let intensity = "NORMAL";
  let message = "Manageable day — steady progress will clear everything.";
  if (score >= 12 || highCount >= 2) {
    intensity = "HECTIC";
    message = "Heavy load — prioritize high-priority deadlines first.";
  } else if (score >= 6) {
    intensity = "BUSY";
    message = "Solid day — keep momentum and protect focus blocks.";
  } else if (total === 0) {
    intensity = "LIGHT";
    message = "Clear mind — no actionable tasks detected.";
  }

  return {
    tasks,
    day_summary: {
      intensity,
      score,
      high_priority_count: highCount,
      deadline_count: deadlineCount,
      appointment_count: appointmentCount,
      total_tasks: total,
      message,
    },
    source: "local_engine",
  };
}
