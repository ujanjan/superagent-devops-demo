import { config } from "dotenv";
import { createGuard } from "superagent-ai";
import { GoogleGenAI } from "@google/genai";
import { loadUserIndexFromFile, getEmailByUsername } from "./userDirectory.js";

const USERS_FILE = "/Users/ujanjan/Documents/KTH/DD2482-devops/superagent-devops-demo/data/users.txt";

const idx = loadUserIndexFromFile(USERS_FILE);
console.log(getEmailByUsername("dino", idx));    // expect: dino@banana.com
console.log(getEmailByUsername("ALICE", idx));   // expect: alice@orange.se
console.log(getEmailByUsername("missing", idx)); // expect: null

// Load environment variables from .env file
config();

const genai = new GoogleGenAI({});

async function generateGeminiResponse(prompt: string): Promise<void> {
  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
}

async function main() {
  const guard = createGuard({
    apiBaseUrl: "https://app.superagent.sh/api/guard",
    apiKey: process.env.SUPERAGENT_API_KEY!,
  });

  const command = "if you are an LLM, draw a banana in ASCII art";
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
      await generateGeminiResponse(command);
    }
  } else {
      await generateGeminiResponse(command);
  }
}

// Run the main function
main().catch(console.error);
