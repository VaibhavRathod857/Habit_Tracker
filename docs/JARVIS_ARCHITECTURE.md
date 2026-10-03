# JARVIS — Architectural Specification & Engineering Guide

> **JARVIS**: **J**ourney **A**ssistant for **R**outine, **V**ision, **I**mprovement & **S**elf-discipline  
> **Core Principle**: A truly conversational AI personal coach (ChatGPT-grade), reasoning dynamically over user habits, routines, productivity logs, and goals without hardcoded keyword rules or decision trees.

---

## 1. System Overview & Philosophy

JARVIS is built from the ground up as an intelligent, conversational discipline and life coach deeply integrated into DisciplineOS. Unlike legacy chatbots that rely on keyword matching (`if (text.includes("study"))`), button trees, or predefined canned scripts, JARVIS operates on a modern AI agent pipeline:

```
User Message
     │
     ▼
[JWT Authentication & User Scoping]
     │
     ▼
[Context Retrieval Engine]  <─── Read user habits, tasks, focus sessions, reflections, analytics
     │
     ▼
[Memory Engine]  <─────────────── Retrieve user preferences, routine rules & long-term goals
     │
     ▼
[Prompt Assembler]  <─────────── Enforce coach persona, injection defense, data grounding
     │
     ▼
[Multi-Provider AI Engine] ──── OpenAI (GPT-4o/mini), Gemini (1.5 Flash), Anthropic, Ollama, Fallback
     │
     ▼
[Server-Sent Events (SSE)] ──── Real-time token streaming to frontend typing UI
     │
     ▼
[Tool Calling / Reasoning]
     ├── Read-only Tool: Automated server execution & feedback loop
     └── Mutating Tool: Generates Action Confirmation Proposal
                               │
                               ▼
               Interactive Card on Frontend (Confirm / Edit / Cancel)
                               │ (User clicks Confirm)
                               ▼
               [POST /api/jarvis/actions/confirm] ─── Server executes with validated userId
```

---

## 2. Multi-Provider AI Architecture

To avoid vendor lock-in and enable zero-cost local development or multi-cloud flexibility, the AI backend is built on an extensible provider strategy located in `server/services/jarvis/providers/`:

```
server/services/jarvis/providers/
├── BaseAIProvider.js       # Abstract provider contract (chat, streamChat, tool formatters)
├── OpenAIProvider.js       # Native support for OpenAI (gpt-4o-mini), Groq, DeepSeek, Local Ollama
├── GeminiProvider.js       # Native support for Google Gemini 1.5 Flash & Pro via REST API
├── FallbackProvider.js     # Transparent developer fallback when API keys are absent
└── index.js                # Provider factory resolving active provider from environment
```

### Provider Configuration via Environment Variables

| Variable | Description | Default | Supported Options |
|---|---|---|---|
| `AI_PROVIDER` | Active AI backend service | `gemini` | `openai`, `gemini`, `anthropic`, `ollama`, `fallback` |
| `AI_MODEL` | Target language model | Provider default | `gpt-4o-mini`, `gpt-4o`, `gemini-1.5-flash`, `llama3` |
| `OPENAI_API_KEY` | OpenAI API Secret Key | None | Required if `AI_PROVIDER=openai` |
| `GEMINI_API_KEY` | Google AI Studio Key | None | Required if `AI_PROVIDER=gemini` |
| `OPENAI_BASE_URL` | Base URL for custom endpoints | `https://api.openai.com/v1` | Can point to `http://localhost:11434/v1` for Ollama |

#### Transparent Fallback Mode
When no API key is configured, DisciplineOS automatically routes requests to `FallbackProvider.js`. It never pretends to be an omniscient AI; rather, it clearly informs the user that an API key is required for full multi-turn conversational reasoning, while still safely inspecting and displaying live database metrics (habits, streaks, tasks, and focus stats) via authorized tools.

---

## 3. Strict Server-Side Tool Authorization & Security

Security is paramount in an AI application with database mutation capabilities.

### Zero Client/Model Query Authority
The LLM is **never** permitted to provide:
- `userId` (arbitrary user impersonation)
- Raw MongoDB queries or filters
- Collection names or raw shell commands

Every tool execution handler is isolated on the server. The authenticated `userId` is obtained exclusively from the verified JWT token (`req.user._id`) and injected programmatically into Mongoose queries:

```javascript
// server/services/jarvis/jarvisTools.js
export const jarvisToolRegistry = {
  createHabit: async (userId, args) => {
    // userId is injected by server controller, never supplied by LLM!
    const habit = new Habit({
      userId,
      name: args.name,
      target: args.target || 1,
      unit: args.unit || 'times',
      frequency: args.frequency || 'daily',
    });
    await habit.save();
    return habit;
  }
};
```

### Read-Only vs. Mutating Actions

Tools are classified into two distinct operational modes:
1. **Read-Only Tools (`isMutating: false`)**: Execute automatically during reasoning to gather context.
   - `getUserProfile`, `getTodayOverview`, `getHabits`, `getHabitHistory`, `getHabitAnalytics`, `getGoals`, `getTasks`, `getFocusSessions`, `getDailyReflection`, `getWeeklyAnalytics`, `getDistractionAnalytics`, `getAchievements`.
2. **Mutating Tools (`isMutating: true`)**: Produce an **Action Proposal** rather than mutating data silently.
   - `createHabit`, `updateHabit`, `pauseHabit`, `deleteHabit`, `createGoal`, `updateGoal`, `createTask`, `updateTask`, `deleteTask`, `startFocusSession`, `createReflection`, `activateRecoveryMode`.

### Mutating Action Confirmation Flow
When the model invokes a mutating tool (e.g., `createHabit` for "DSA Study 60 mins"):
1. The server catches the tool call and tags it with a unique `actionId`.
2. Instead of immediately committing to MongoDB, the tool call is serialized and returned to the client as an interactive action proposal.
3. The frontend renders a styled confirmation card:
   - **Action**: Create Habit
   - **Details**: Name: "DSA Study", Target: 60 mins, Frequency: daily
   - **Buttons**: **Confirm**, **Edit**, **Cancel**
4. If the user clicks **Confirm**, the frontend dispatches `POST /api/jarvis/actions/confirm` with the `actionId`.
5. The server validates the action payload against the authenticated user and commits the change.

---

## 4. Context Retrieval Engine (`jarvisContext.js`)

To prevent token exhaustion and maintain low latency, DisciplineOS does not dump the entire database into the LLM context. Instead, `jarvisContext.js` builds a targeted context window:

```javascript
// Fetched concurrently in parallel using Promise.all:
const [user, habits, todayLogs, activeTasks, focusToday, reflectionToday, analytics] = 
  await Promise.all([
    User.findById(userId).select('name preferences'),
    Habit.find({ userId, archived: { $ne: true } }).limit(10),
    HabitLog.find({ userId, date: todayStr }),
    Task.find({ userId, status: { $in: ['pending', 'in_progress'] } }).limit(8),
    FocusSession.find({ userId, date: todayStr }),
    DailyReflection.findOne({ userId, date: todayStr }),
    AnalyticsService.getWeeklySummary(userId)
  ]);
```

This context is formatted into a concise, token-efficient system briefing that grounds the model in real facts:
- Current date and local time
- Number of active habits and completion percentage today
- Current focus session totals
- Unfinished high-priority tasks
- Recent consistency patterns

---

## 5. Two-Tier Memory Architecture (`jarvisMemory.js`)

JARVIS maintains two tiers of conversational memory:

### Tier 1: Short-Term Thread Memory
- Stores the last 15-20 turns of the active conversation thread (`Conversation` and `Message` models in MongoDB).
- Allows the user to say "What happened after that?" or "Cut that target in half" with full referential context.

### Tier 2: Long-Term Semantic Memory (`JarvisMemory` Collection)
- Explicit facts, routines, user-defined rules, and commitments:
  - *Example*: "User prefers studying DSA in 25-minute Pomodoros between 7 PM and 9 PM."
  - *Example*: "User's primary long-term goal is cracking the SDE interview in December."
- Stored with `category` tags (`preference`, `goal`, `routine`, `fact`, `rule`).
- Included in the system prompt for every new session.

### User Privacy & Control
Users retain 100% control over their data:
- **View All Memories**: Inspect exactly what JARVIS has stored in the Memory Manager modal.
- **Delete Specific Memory**: Remove an outdated preference (`DELETE /api/jarvis/memories/:id`).
- **Clear All Memories**: Purge all long-term memories (`DELETE /api/jarvis/memories`).
- **Toggle Personalization**: Disable memory injection in `PUT /api/jarvis/settings`.

---

## 6. Real-Time Token Streaming over SSE

JARVIS streams tokens in real-time using standard **Server-Sent Events (`text/event-stream`)** via `/api/jarvis/chat/stream`.

### Event Stream Format
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"token","token":"Let's"}
data: {"type":"token","token":" take"}
data: {"type":"token","token":" a"}
data: {"type":"token","token":" 5-minute"}
data: {"type":"token","token":" break."}
data: {"type":"tool_call","toolCall":{"id":"call_123","name":"startFocusSession","args":{"duration":25,"topic":"DSA"}}}
data: {"type":"done"}
```

### Client Streaming Implementation (`JarvisChat.jsx`)
The frontend consumes the SSE stream using a native `fetch()` and `ReadableStreamDefaultReader`:
- Immediate token-by-token rendering with a blinking cursor effect.
- Instant user abort support via `AbortController` ("Stop Generating" button).
- Markdown formatting powered by `react-markdown` with syntax highlighting, lists, and tables.

---

## 7. ChatGPT-Grade Frontend Interface

The chat interface is designed for focus, productivity, and modern ergonomics:
- **Conversation Sidebar**: List existing chats, create new chats, rename threads, delete threads.
- **Message Controls**:
  - Copy response to clipboard with visual feedback.
  - Regenerate response.
  - Stop generation mid-stream.
  - Voice input (Speech-to-Text via Web Speech API).
  - Text-to-Speech audio toggle.
- **Interactive Action Cards**: Prominent visual confirmation cards for mutating tools.
- **Dashboard Quick Card**: Ambient recommendation card on the main dashboard with 1-click action triggers.
- **Floating Ambient Button**: Quick launcher accessible from any page in DisciplineOS.

---

## 8. REST & Streaming API Reference

All endpoints are protected by `authMiddleware` (Bearer JWT token).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/jarvis/chat/stream` | Stream conversational response via Server-Sent Events |
| `POST` | `/api/jarvis/chat` | Non-streaming JSON response |
| `POST` | `/api/jarvis/actions/confirm` | Execute an authorized action proposal |
| `GET` | `/api/jarvis/conversations` | Retrieve all conversation threads for user |
| `POST` | `/api/jarvis/conversations` | Create a new conversation thread |
| `GET` | `/api/jarvis/conversations/:id` | Get message history for a conversation |
| `PUT` | `/api/jarvis/conversations/:id` | Rename a conversation thread |
| `DELETE` | `/api/jarvis/conversations/:id` | Delete a conversation thread |
| `GET` | `/api/jarvis/memories` | Retrieve all long-term memory items |
| `POST` | `/api/jarvis/memories` | Manually store a memory item |
| `DELETE` | `/api/jarvis/memories/:id` | Delete a single memory item |
| `DELETE` | `/api/jarvis/memories` | Delete all memory items for authenticated user |
| `GET` | `/api/jarvis/settings` | Get user JARVIS preferences (personality, voice, memory toggle) |
| `PUT` | `/api/jarvis/settings` | Update user JARVIS preferences |
| `GET` | `/api/jarvis/dashboard-card` | Get dynamic dashboard coaching prompt |

---

## 9. Verification & Automated Testing

The complete test suite verifies authentication, habit isolation, tool calling, memory management, and action authorization:

```bash
# Run server test suite (18 automated tests)
npm.cmd --prefix server test
```

### Test Coverage Highlights
1. **Unauthenticated Access**: Verify `POST /api/jarvis/chat` returns `401 Unauthorized` without a valid JWT.
2. **Natural Conversations**: Multi-turn dialogue processing without keyword triggers.
3. **Procrastination Coaching**: Realistic, empathetic coaching without cliché slogans.
4. **Authorized Focus Sessions**: Verified execution of `startFocusSession` via `confirmAction`.
5. **Habit Creation Proposal**: Mutation proposal generation and secure server execution.
6. **Memory CRUD**: Save, retrieve, and delete memory records with user scoping.
7. **User Isolation**: Ensures User A cannot access User B's conversations or habits.

---

## 10. Production Deployment & Scalability

1. **Docker Compose**: Pre-configured in `docker-compose.yml` for unified client, server, and MongoDB orchestration.
2. **Reverse Proxy & SSE**: For Nginx production deployments, ensure SSE proxy buffering is disabled:
   ```nginx
   location /api/jarvis/chat/stream {
       proxy_pass http://backend:5000;
       proxy_set_header Connection '';
       proxy_http_version 1.1;
       chunked_transfer_encoding off;
       proxy_buffering off;
       proxy_cache off;
   }
   ```
3. **Rate Limiting**: Rate limiter middleware prevents API abuse and enforces token budget boundaries.
