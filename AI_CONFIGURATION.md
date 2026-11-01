# 🧠 AI Provider Configuration Guide

PocketForge AI gives you total freedom over your AI development models. It directly supports three leading providers with fallback orchestration:

1. **Google Gemini** (Gemini 2.5 Flash, Gemini 2.5 Pro)
2. **Groq** (Ultra-fast Llama 3.3 70B, Mixtral 8x7B)
3. **OpenRouter** (Unified router for Claude 3.5 Sonnet, DeepSeek V3/R1, GPT-4o)

---

## 🔑 Obtaining Free API Keys

### 1. Google Gemini API
- **Cost:** Free tier available (Generous limits for Gemini Flash)
- **Get Key:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Recommended Models:**
  - `gemini-2.5-flash` (Lightning fast code generation, ideal for mobile)
  - `gemini-2.5-pro` (Advanced architectural planning and deep debugging)

### 2. Groq Cloud
- **Cost:** Generous free tier with ultra-low latency inference
- **Get Key:** [https://console.groq.com/keys](https://console.groq.com/keys)
- **Recommended Models:**
  - `llama-3.3-70b-versatile` (Exceptional coding benchmarks)
  - `mixtral-8x7b-32768` (High context coding)

### 3. OpenRouter
- **Cost:** Pay-as-you-go + free community models (`openrouter/auto`)
- **Get Key:** [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **Recommended Models:**
  - `deepseek/deepseek-chat`
  - `anthropic/claude-3.5-sonnet`
  - `meta-llama/llama-3.3-70b-instruct`

---

## 🔒 Security & Local Key Storage

PocketForge AI adheres to strict local security policies:
- **No Proxy Middleman:** All requests are sent directly from your device to the official provider endpoints (`generativelanguage.googleapis.com`, `api.groq.com`, `openrouter.ai`).
- **Encrypted Local Storage:** Keys are saved exclusively in your browser's private local storage or IndexedDB.
- **Never Committed:** PocketForge's Linux Mint and ZIP export tools automatically scan and strip any API keys before packaging files.

---

## 🔄 Provider Fallback Configuration

In **AI Studio** -> **Provider Settings**:
1. Check **"Enable Automatic Fallback"**.
2. Set your primary provider (e.g. Gemini).
3. Set your secondary backup provider (e.g. Groq).
If the primary provider encounters a rate limit (HTTP 429) or outage, PocketForge will seamlessly route the query to your backup provider without dropping your session or task queue!

---

## 🤖 The 4-Agent Pipeline in AI Studio

PocketForge divides development tasks into 4 dedicated AI agents:

1. **ARCHITECT**
   - Ingests user requirement.
   - Outputs system design, tech stack recommendations, file tree layout, and task breakdown.
   - Pauses for your explicit approval before any code is generated.

2. **CODER**
   - Generates production-ready file contents based strictly on the Architect's approved blueprint.
   - Shows diffs and file targets.

3. **DEBUGGER**
   - Parses compiler, terminal, and runtime errors.
   - Pinpoints exact root causes and prepares surgical patches.

4. **TESTER**
   - Designs unit/integration test suites.
   - Coordinates with Termux Local Agent to execute test runners (`npm test`, `pytest`) and streams authentic exit codes and outputs.
