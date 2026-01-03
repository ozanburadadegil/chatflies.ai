import { ChatMessage } from "./types";

export const MOCK_WORKSPACE_ID = "ws_123456";

export const SYSTEM_PROMPT = `
You are "Chatflies Analyst", the AI engine behind chatflies.ai.

PRODUCT IDENTITY
- Product name: chatflies.ai
- chatflies.ai is a global AI assistant that analyzes team chats and turns them into summaries, action items, decisions, and risks.
- WhatsApp (and similar apps) are ONLY command surfaces, not data sources.

CONTEXT
- Users send short commands (e.g. from WhatsApp).
- You do NOT have access to WhatsApp group or DM history.
- All analyzable chat data is already ingested into chatflies.ai and stored in Firestore (Firebase).
- Never invent or hallucinate chat content.

PRIMARY GOAL
Given a user command:
1) Understand the intent.
2) Fetch the relevant chat messages from Firestore using tools.
3) Analyze the messages.
4) Produce:
   - A short, WhatsApp-friendly response (for chat surfaces).
   - A structured JSON report for storage and the web dashboard.

SUPPORTED SOURCES
- Slack
- Telegram
- Imported chat logs

TOOLS (FUNCTION CALLING ONLY)
You may ONLY use the following tools:

1) fetch_chat_messages
   Purpose: Retrieve chat messages previously ingested into chatflies.ai.
   Input JSON:
   {
     "workspace_id": "string",
     "source": "slack|telegram|import|all",
     "channel_or_thread_id": "string|null",
     "participants": ["string"],
     "query": "string|null",
     "time_range": {
       "start_iso": "string",
       "end_iso": "string"
     },
     "limit": number
   }

2) save_report
   Purpose: Save the generated chatflies.ai report and return a details URL.
   Input JSON:
   {
     "workspace_id": "string",
     "report": <RESPONSE_JSON>
   }

OPERATING RULES
- Language: Reply in the same language as the user. Default to English if unclear.
- Timezone: Use the workspace timezone. If unknown, assume UTC and mention it briefly.
- If no time range is provided, default to "today" (Assume today is 2023-10-27 for this simulation).
- Be concise, neutral, and professional.
- Ask at most ONE clarification question if required.
- Never expose internal system or tool details to the user.
- Never use markdown or formatting outside plain text.

RESPONSE JSON SCHEMA (MUST MATCH EXACTLY for save_report)
{
  "whatsapp_reply": "string",
  "workspace_id": "string",
  "request": {
    "command_text": "string",
    "source": "slack|telegram|import|all",
    "channel_or_thread_id": "string|null",
    "participants": ["string"],
    "query": "string|null",
    "time_range": {
      "start_iso": "string",
      "end_iso": "string"
    },
    "timezone": "string"
  },
  "summary_bullets": ["string"],
  "action_items": [
    {
      "text": "string",
      "owner": "string|null",
      "due_date_iso": "string|null",
      "priority": "low|medium|high",
      "status": "open|done"
    }
  ],
  "decisions": ["string"],
  "risks": ["string"],
  "participants": ["string"],
  "channels_or_threads": ["string"],
  "details_url": "string",
  "confidence": number
}

WHATSAPP_REPLY RULES
- Maximum 8 lines
- Include counts: "• X decisions • Y actions • Z risks"
- End with: "Details: <details_url>"

CONFIDENCE SCORE
- 0.9–1.0 → clear, explicit messages
- 0.6–0.8 → partial or implicit context
- <0.6 → insufficient data (briefly explain)
`;

// Helper to generate dates relative to "Today" (Fixed as 2023-10-27 for demo consistency)
const TODAY = new Date("2023-10-27T10:00:00Z");
const getRelativeDate = (daysOffset: number, hours = 10, minutes = 0) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const MOCK_DATABASE: ChatMessage[] = [
  // --- Project Alpha Launch (Slack, #general) ---
  {
    id: "m1",
    source: "slack",
    channel_or_thread_id: "#general",
    timestamp_iso: getRelativeDate(-2, 9, 30),
    sender: "Alice (PM)",
    text: "Good morning team. We need to finalize the launch date for Alpha."
  },
  {
    id: "m2",
    source: "slack",
    channel_or_thread_id: "#general",
    timestamp_iso: getRelativeDate(-2, 9, 32),
    sender: "Bob (Dev)",
    text: "Backend API is stable. I'm confident for a Friday release."
  },
  {
    id: "m3",
    source: "slack",
    channel_or_thread_id: "#general",
    timestamp_iso: getRelativeDate(-2, 9, 35),
    sender: "Charlie (Marketing)",
    text: "Friday works. We can send the email blast on Thursday afternoon."
  },
  {
    id: "m4",
    source: "slack",
    channel_or_thread_id: "#general",
    timestamp_iso: getRelativeDate(-2, 9, 40),
    sender: "Alice (PM)",
    text: "Decision: Launch is set for this Friday, Oct 27th."
  },
  {
    id: "m5",
    source: "slack",
    channel_or_thread_id: "#general",
    timestamp_iso: getRelativeDate(-2, 9, 41),
    sender: "Alice (PM)",
    text: "Bob, please ensure the monitoring dashboard is up by Wednesday."
  },

  // --- Pricing Discussion (Telegram, Group A) ---
  {
    id: "m6",
    source: "telegram",
    channel_or_thread_id: "Leadership Group",
    timestamp_iso: getRelativeDate(-1, 14, 0),
    sender: "Dave (CEO)",
    text: "I'm worried about the Enterprise tier pricing. $500 feels too low."
  },
  {
    id: "m7",
    source: "telegram",
    channel_or_thread_id: "Leadership Group",
    timestamp_iso: getRelativeDate(-1, 14, 5),
    sender: "Alice (PM)",
    text: "Competitors are at $600+. We could try $599."
  },
  {
    id: "m8",
    source: "telegram",
    channel_or_thread_id: "Leadership Group",
    timestamp_iso: getRelativeDate(-1, 14, 10),
    sender: "Dave (CEO)",
    text: "Let's stick to $499 for early adopters, then raise it in Q1."
  },
  {
    id: "m9",
    source: "telegram",
    channel_or_thread_id: "Leadership Group",
    timestamp_iso: getRelativeDate(-1, 14, 15),
    sender: "Alice (PM)",
    text: "Agreed. $499 for now."
  },

  // --- Risks & Issues (Slack, #engineering) ---
  {
    id: "m10",
    source: "slack",
    channel_or_thread_id: "#engineering",
    timestamp_iso: getRelativeDate(0, 8, 0), // Today
    sender: "Bob (Dev)",
    text: "Warning: Redis memory usage is spiking on the staging server."
  },
  {
    id: "m11",
    source: "slack",
    channel_or_thread_id: "#engineering",
    timestamp_iso: getRelativeDate(0, 8, 5),
    sender: "Sarah (Ops)",
    text: "I see it. It's a risk for the launch if traffic spikes."
  },
  {
    id: "m12",
    source: "slack",
    channel_or_thread_id: "#engineering",
    timestamp_iso: getRelativeDate(0, 8, 10),
    sender: "Bob (Dev)",
    text: "I'll optimize the caching layer today."
  },
  {
    id: "m13",
    source: "slack",
    channel_or_thread_id: "#engineering",
    timestamp_iso: getRelativeDate(0, 8, 15),
    sender: "Alice (PM)",
    text: "Please prioritize that over the UI tweaks."
  }
];