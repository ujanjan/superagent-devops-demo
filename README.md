# Superagent DevOps Demo

A simple TypeScript demo application showcasing Superagent Guard integration for command security validation with Google Gemini API integration.

## Features

- **Superagent Guard Integration**: Validates commands for security violations before execution
- **Google Gemini API Integration**: Processes approved commands through Gemini 2.0 Flash model
- **Environment Variable Management**: Uses dotenv for secure API key handling
- **TypeScript Support**: Full TypeScript configuration with ES modules

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   SUPERAGENT_API_KEY=your-actual-superagent-api-key-here
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

3. **Get API Keys:**
   - **Superagent API Key**: Get your API key from [Superagent API Keys](https://app.superagent.sh/api-keys)
   - **Gemini API Key**: Get your API key from [Google AI Studio API Keys](https://aistudio.google.com/api-keys)

4. **Run the application:**
   ```bash
   npm start
   ```

## Usage

The application demonstrates how to use Superagent Guard to validate commands and process approved commands through Gemini API:

```typescript
const { decision, reasoning } = await guard(command, {
  onBlock: (reason) => {
    console.warn("Guard blocked command:", reason);
  },
  onPass: () => {
    console.log("Guard approved command, continue!");
  },
});

if (decision?.status !== "block") {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: command,
  });
  console.log(response.text);
}
```

## Project Structure

```
├── src/
│   └── index.ts          # Main application file
├── .env.template         # Environment variables template
├── .env                  # Environment variables (ignored by git)
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Dependencies

- `superagent-ai`: Superagent Guard TypeScript SDK
- `@google/genai`: Google Gemini API TypeScript SDK
- `dotenv`: Environment variable management
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution for Node.js

## Credits

This demo is based on the [Superagent Guard TypeScript SDK](https://docs.superagent.sh/typescript-sdk) and [Google Gemini API](https://ai.google.dev/gemini-api/docs/quickstart) documentation and examples.

---

**Project for DD2482 DevOps Course at KTH Royal Institute of Technology**  
Course repository: [KTH/devops-course](https://github.com/KTH/devops-course)
