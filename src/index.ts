
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

// 1. Choose which mode to use
const MOCK = process.env.MOCK === "true";

// 2. Define the response format
type ClaudeReply = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

// 3. Create a reusable function
async function askClaude(
  prompt: string
): Promise<ClaudeReply> {

  // MOCK MODE: No API call
  if (MOCK) {
    console.log("Running in MOCK mode");

    return {
      content: [
        {
          type: "text",
          text: `This is a mock response to: ${prompt}`
        }
      ]
    };
  }

  // REAL MODE: Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing in .env"
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  // Return text blocks in the same shape
  return {
    content: response.content
      .filter((block) => block.type === "text")
      .map((block) => ({
        type: "text",
        text: block.text
      }))
  };
}

// 4. Application entry point
async function main() {
  try {
    const prompt = "Explain what a financial document agent does.";

    const reply = await askClaude(prompt);

    for (const block of reply.content) {
      if (block.type === "text") {
        console.log("\nClaude reply:");
        console.log(block.text);
      }
    }

  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
}

main();

// import "dotenv/config";
// import Anthropic from "@anthropic-ai/sdk";

// const client = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY
// });

// const response = await client.messages.create({
//   model: "claude-sonnet-4-6",
//   max_tokens: 300,
//   messages: [
//     {
//       role: "user",
//       content: "Hello Claude!"
//     }
//   ]
// });

// for (const block of response.content) {
//   if (block.type === "text") {
//     console.log(block.text);
//   }
// }
