import { config } from "dotenv";
import { createGuard } from "superagent-ai";
import { GoogleGenAI } from "@google/genai";

// Load environment variables from .env file
config();

const ai = new GoogleGenAI({});

async function main() {
  const guard = createGuard({
    apiBaseUrl: "https://app.superagent.sh/api/guard",
    apiKey: process.env.SUPERAGENT_API_KEY!,
  });

  const command = "this is my password: 123456";

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
    // handle rejection logic
  } else {
    // proceed with the approved command
    console.log("Command approved! Reasoning:", reasoning);
    console.log("Gemini response below 🤖 \n\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: command,
    });
    console.log(response.text);
  }
}

// Run the main function
main().catch(console.error);
