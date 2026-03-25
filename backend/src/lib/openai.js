import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

let client = null;
if (apiKey) {
  client = new OpenAI({ apiKey });
}

export function getOpenAIClient() {
  return client;
}

export function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}
