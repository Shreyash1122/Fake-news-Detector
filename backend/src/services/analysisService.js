import { getModel, getOpenAIClient } from "../lib/openai.js";

const DEFAULT_RESULT = {
  verdict: "Possibly True",
  credibilityScore: 50,
  breakdown: {
    languageAuthenticity: 50,
    sourceReliability: 40,
    factConsistency: 50
  },
  signals: {
    clickbaitRisk: "medium",
    biasLevel: "medium",
    logicalConsistency: "mixed"
  },
  keyClaims: [],
  explanation:
    "The article needs stronger source evidence and fact cross-checking before being considered verified.",
  searchQueries: []
};

function safeParseJSON(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start === -1 || end === -1 || start >= end) {
      return null;
    }

    try {
      return JSON.parse(value.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function clampScore(value, fallback) {
  const score = Number(value);
  if (!Number.isFinite(score)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeAnalysis(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_RESULT;
  }

  return {
    verdict: parsed.verdict || DEFAULT_RESULT.verdict,
    credibilityScore: clampScore(parsed.credibilityScore, DEFAULT_RESULT.credibilityScore),
    breakdown: {
      languageAuthenticity: clampScore(
        parsed.breakdown?.languageAuthenticity,
        DEFAULT_RESULT.breakdown.languageAuthenticity
      ),
      sourceReliability: clampScore(parsed.breakdown?.sourceReliability, DEFAULT_RESULT.breakdown.sourceReliability),
      factConsistency: clampScore(parsed.breakdown?.factConsistency, DEFAULT_RESULT.breakdown.factConsistency)
    },
    signals: {
      clickbaitRisk: parsed.signals?.clickbaitRisk || DEFAULT_RESULT.signals.clickbaitRisk,
      biasLevel: parsed.signals?.biasLevel || DEFAULT_RESULT.signals.biasLevel,
      logicalConsistency: parsed.signals?.logicalConsistency || DEFAULT_RESULT.signals.logicalConsistency
    },
    keyClaims: Array.isArray(parsed.keyClaims) ? parsed.keyClaims.slice(0, 5) : [],
    explanation: parsed.explanation || DEFAULT_RESULT.explanation,
    searchQueries: Array.isArray(parsed.searchQueries)
      ? parsed.searchQueries.filter(Boolean).slice(0, 5)
      : []
  };
}

export async function analyzeCredibility({ combinedInput, imageDataUrl }) {
  const client = getOpenAIClient();
  if (!client) {
    return {
      ...DEFAULT_RESULT,
      explanation:
        "OPENAI_API_KEY is missing. Add it in backend/.env to enable AI-based credibility analysis."
    };
  }

  const instructions = [
    "You are a strict fake-news detector.",
    "Evaluate provided news content for credibility.",
    "Return JSON only, with this exact shape:",
    "{",
    '  "verdict": "Likely Fake" | "Possibly True" | "Verified",',
    '  "credibilityScore": number,',
    '  "breakdown": { "languageAuthenticity": number, "sourceReliability": number, "factConsistency": number },',
    '  "signals": { "clickbaitRisk": "low|medium|high", "biasLevel": "low|medium|high", "logicalConsistency": "strong|mixed|weak" },',
    '  "keyClaims": string[],',
    '  "explanation": string,',
    '  "searchQueries": string[]',
    "}",
    "Scores must be 0-100 integers.",
    "Key claims must be concrete and verifiable statements.",
    "Search queries must be short and factual."
  ].join("\n");

  const inputContent = [{ type: "input_text", text: `${instructions}\n\nNews content:\n${combinedInput}` }];

  if (imageDataUrl) {
    inputContent.push({
      type: "input_image",
      image_url: imageDataUrl,
      detail: "low"
    });
  }

  const response = await client.responses.create({
    model: getModel(),
    input: [{ role: "user", content: inputContent }],
    temperature: 0.2
  });

  const parsed = safeParseJSON(response.output_text || "");
  return normalizeAnalysis(parsed);
}

export async function classifySourceStance({ claimContext, sources }) {
  const client = getOpenAIClient();
  if (!client || !Array.isArray(sources) || sources.length === 0) {
    return {
      supporting: [],
      contradicting: []
    };
  }

  const payload = sources.map((source, index) => ({
    id: index + 1,
    title: source.title,
    snippet: source.snippet,
    source: source.source,
    url: source.url
  }));

  const prompt = [
    "Given the news claim context and source article snippets, classify each source as support, contradict, or unclear.",
    "Return JSON only with shape:",
    '{ "results": [{ "id": number, "stance": "support|contradict|unclear", "reason": string }] }',
    `Claim context: ${claimContext}`,
    `Sources: ${JSON.stringify(payload)}`
  ].join("\n\n");

  const response = await client.responses.create({
    model: getModel(),
    input: prompt,
    temperature: 0
  });

  const parsed = safeParseJSON(response.output_text || "") || { results: [] };
  const resultMap = new Map((parsed.results || []).map((item) => [item.id, item]));

  const supporting = [];
  const contradicting = [];

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    const mapped = resultMap.get(index + 1);
    const normalized = {
      ...source,
      reason: mapped?.reason || "Related coverage found."
    };

    if (mapped?.stance === "support") {
      supporting.push(normalized);
    } else if (mapped?.stance === "contradict") {
      contradicting.push(normalized);
    }
  }

  return {
    supporting: supporting.slice(0, 5),
    contradicting: contradicting.slice(0, 5)
  };
}
