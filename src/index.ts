import { config } from "dotenv";
import { createGuard } from "superagent-ai";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { loadUserIndexFromFile, getEmailByUsername } from "./userDirectory.js";
import readline from "node:readline";

// Load environment variables from .env file
config({ quiet: true });

const useSuperagent = false;
const useTools = true;
console.log("useSuperagent:", useSuperagent);
console.log("useTools:", useTools);
console.log("\n");

const USERS_FILE = "/Users/ujanjan/Documents/KTH/DD2482-devops/superagent-devops-demo/data/users.txt";
const idx = loadUserIndexFromFile(USERS_FILE);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Gemini function calling: allow the model to call a tool to fetch user email
async function generateGeminiWithTools(command: string): Promise<void> {
  const tools = [
    {
      functionDeclarations: [
        {
          name: "get_user_email",
          description: "Get email by username (case-insensitive).",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              username: { type: SchemaType.STRING, description: "The username to look up" },
            },
            required: ["username"],
          },
        },
      ],
    },
  ] as any;

  const model = genAI.getGenerativeModel(
    useTools
      ? {
          model: "gemini-2.0-flash-lite",
          tools,
          systemInstruction: "If the user asks for an email, call get_user_email.",
        }
      : {
          model: "gemini-2.0-flash-lite",
        }
  );

  const first = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: command }] },
    ],
  });

  if (!useTools) {
    console.log(first.response.text());
    return;
  }

  const candidate = first.response.candidates?.[0];
  const callPart = candidate?.content?.parts?.find((p: any) => p.functionCall);
  const functionCall = (callPart as any)?.functionCall;

  if (functionCall?.name === "get_user_email") {
    const username = (functionCall.args?.username ?? "") as string;
    const email = getEmailByUsername(username, idx);

    const followUp = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: command }] },
        { role: "model", parts: [{ functionCall }] },
        { role: "tool", parts: [{ functionResponse: { name: "get_user_email", response: { email, username } } }] },
      ],
    });

    console.log(followUp.response.text());
    return;
  }

  console.log(first.response.text());
}

async function main() {

  const guard = createGuard({
    apiBaseUrl: "https://app.superagent.sh/api/guard",
    apiKey: process.env.SUPERAGENT_API_KEY!,
  });

  const args = process.argv.slice(2);

  // If no args, prompt interactively
  const command = await (async () => {
    if (args.length > 0) return args.join(" ");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));
    const input = await question("Enter chat: ");
    rl.close();
    return input.trim();
  })();
  console.log("\n");

  if (useSuperagent) {
    console.log("--------------------------------");
    console.log("🛡️ Using Superagent Guard... 🛡️\n");
    const { decision, reasoning } = await guard(command, {
      onBlock: (reason) => {
        console.warn("\x1b[33m%s\x1b[0m", "Guard blocked command:", reason);
      },
      onPass: () => {
        console.log("\x1b[34m%s\x1b[0m", "Guard approved command, continue!");
      },
    });

    if (decision?.status === "block") {
      console.warn("Violations:", decision.violation_types ?? []);
      console.warn("CWE codes:", decision.cwe_codes ?? []);
      console.log("--------------------------------\n");

    } else {
      // proceed with the approved command
      console.log("Command approved! Reasoning:", reasoning);
      console.log("\n 🤖 Gemini response below 🤖");
      console.log("--------------------------------\n");
      await generateGeminiWithTools(command);
    }
  } else {
      await generateGeminiWithTools(command);
  }
  console.log("\n");
}

// Run the main function
main().catch(console.error);
