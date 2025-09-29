import { config } from "dotenv";
import { createGuard } from "superagent-ai";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { loadUserIndexFromFile, getEmailByUsername } from "./userDirectory.js";

const USERS_FILE = "/Users/ujanjan/Documents/KTH/DD2482-devops/superagent-devops-demo/data/users.txt";

const idx = loadUserIndexFromFile(USERS_FILE);
console.log(getEmailByUsername("dino", idx));    // expect: dino@banana.com
console.log(getEmailByUsername("ALICE", idx));   // expect: alice@orange.se
console.log(getEmailByUsername("missing", idx)); // expect: null

// Load environment variables from .env file
config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

function extractResponseText(maybeResponse: any): string | undefined {
  const r = maybeResponse?.response ?? maybeResponse;
  const t = r?.text;
  if (typeof t === "function") {
    try { return t.call(r); } catch {}
  }
  if (typeof t === "string") return t;
  return undefined;
}

async function generateGeminiResponse(prompt: string): Promise<void> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  console.log(response.response.text());
}

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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools,
    systemInstruction: "If the user asks for an email, call get_user_email.",
  });

  const first = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: command }] },
    ],
  });

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

  const command = "whats the email for bingjie?";
  console.log("Command: ", command);

  const useSuperagent = false;

  if (useSuperagent) {
    const { decision, reasoning } = await guard(command, {
      onBlock: (reason) => {
        console.warn("Guard blocked command:", reason);
      },
      onPass: () => {
        console.log("Guard approved command, continue!");
      },
    });

    if (decision?.status === "block") {
      console.warn("Violations:", decision.violation_types ?? []);
      console.warn("CWE codes:", decision.cwe_codes ?? []);

    } else {
      // proceed with the approved command
      console.log("Command approved! Reasoning:", reasoning);
      console.log("Gemini response below 🤖 \n\n");
      await generateGeminiWithTools(command);
    }
  } else {
      await generateGeminiWithTools(command);
  }
}

// Run the main function
main().catch(console.error);
