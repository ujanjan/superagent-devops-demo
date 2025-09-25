# Superagent DevOps Demo

A simple TypeScript demo application showcasing Superagent Guard integration for command security validation.

## Features

- **Superagent Guard Integration**: Validates commands for security violations before execution
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
   
   Edit `.env` and add your Superagent API key:
   ```
   SUPERAGENT_API_KEY=your-actual-api-key-here
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## Usage

The application demonstrates how to use Superagent Guard to validate commands:

```typescript
const { decision, reasoning } = await guard(command, {
  onBlock: (reason) => {
    console.warn("Guard blocked command:", reason);
  },
  onPass: () => {
    console.log("Guard approved command, continue!");
  },
});
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
- `dotenv`: Environment variable management
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution for Node.js

## Credits

This demo is based on the [Superagent Guard TypeScript SDK](https://docs.superagent.sh/typescript-sdk) documentation and examples.
