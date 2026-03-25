function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function fetchArticleFromUrl(url) {
  if (!isValidHttpUrl(url)) {
    throw new Error("Please provide a valid http(s) URL.");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (CredibilityCheckerBot/1.0)"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch URL content (${response.status}).`);
  }

  const html = await response.text();
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).slice(0, 200) : "";
  const extractedText = stripTags(html).slice(0, 9000);

  return {
    title,
    extractedText
  };
}

export function buildAnalysisInput({ text, url, fetchedTitle, fetchedText }) {
  const textBlock = text?.trim() || "";
  const urlBlock = url?.trim() || "";
  const fetchedBlock = fetchedText?.trim() || "";

  return [
    textBlock ? `User provided text:\n${textBlock}` : "",
    urlBlock ? `Original URL:\n${urlBlock}` : "",
    fetchedTitle ? `Fetched title:\n${fetchedTitle}` : "",
    fetchedBlock ? `Fetched article text:\n${fetchedBlock}` : ""
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 15000);
}
