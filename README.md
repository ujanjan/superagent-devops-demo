# Superagent DevOps Demo

A minimal TypeScript demo showing optional Superagent Guard validation and Google Gemini function-calling.

## Features

- **Superagent Guard (optional)**: Validate potentially unsafe commands before running
- **Gemini function-calling**: Tool-call to fetch a user email from a local index
- **.env support**: Loads keys via `dotenv`
- **TypeScript + ESM**: Runs with `tsx`

## Requirements

- Node.js 18+
- API keys:
  - Superagent: get from [Superagent API Keys](https://app.superagent.sh/api-keys)
  - Google Gemini: get from [Google AI Studio](https://aistudio.google.com/api-keys)

## Setup

1. Install deps:
   ```bash
   npm install
   ```

2. Create `.env` with:
   ```
   SUPERAGENT_API_KEY=your-superagent-key
   GOOGLE_API_KEY=your-gemini-key
   ```

3. Data file: the app looks up emails from `data/users.txt` with lines like:
   ```
   username,email@example.com
   alice,alice@example.com
   bob,bob@example.com
   ```
   The demo expects a readable file and ignores empty/comment lines (`# ...`). If your absolute path differs, update `USERS_FILE` in `src/index.ts`.

## Run

Interactive prompt:
```bash
npm start
```

Pass a message directly:
```bash
npm start -- "What's Alice's email?"
```

By default, Superagent Guard is disabled and Gemini tool-calling is enabled. You can toggle behavior in `src/index.ts` via:
- `useSuperagent`: set to `true` to enable Guard validation
- `useTools`: set to `false` to run plain text generation

## How it works (brief)

- If Guard is enabled and blocks, the app logs the reason and stops.
- Otherwise, Gemini (model: `gemini-2.0-flash-lite`) may call the tool `get_user_email(username)`; the app resolves it using `data/users.txt` and returns a final answer.

## Project Structure

```
├── data/
│   └── users.txt          # username,email per line
├── src/
│   ├── index.ts           # main app with Guard + Gemini
│   └── userDirectory.ts   # user index loader + lookup
├── package.json
└── tsconfig.json
```

## Dependencies

- `superagent-ai`
- `@google/generative-ai`
- `dotenv`
- `tsx`, `typescript`

## Notes

- Keep it simple: this is a teaching demo. Adjust paths/flags in `src/index.ts` as needed.

---

**Project for DD2482 DevOps Course at KTH Royal Institute of Technology**  
Course repository: [KTH/devops-course](https://github.com/KTH/devops-course)
