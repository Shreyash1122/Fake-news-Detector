const NEWS_API_BASE_URL = "https://newsapi.org/v2/everything";

function trimText(value, max = 240) {
  if (!value) {
    return "";
  }
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

export async function fetchSourceCandidates(queries = []) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return {
      sources: [],
      note: "NEWS_API_KEY not set. Source verification is running in limited mode."
    };
  }

  const uniqueQueries = [...new Set((queries || []).map((item) => item?.trim()).filter(Boolean))].slice(0, 3);
  if (uniqueQueries.length === 0) {
    return { sources: [], note: "No claims available for source verification." };
  }

  const allArticles = [];

  for (const query of uniqueQueries) {
    const params = new URLSearchParams({
      q: query,
      language: "en",
      sortBy: "relevancy",
      pageSize: "5",
      apiKey
    });

    const response = await fetch(`${NEWS_API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      continue;
    }

    const payload = await response.json();
    const articles = Array.isArray(payload.articles) ? payload.articles : [];

    for (const article of articles) {
      if (!article.url || !article.title) {
        continue;
      }

      allArticles.push({
        title: article.title,
        url: article.url,
        source: article.source?.name || "Unknown source",
        publishedAt: article.publishedAt || "",
        snippet: trimText(article.description || article.content || "")
      });
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const article of allArticles) {
    if (seen.has(article.url)) {
      continue;
    }
    seen.add(article.url);
    deduped.push(article);
  }

  return {
    sources: deduped.slice(0, 10),
    note: deduped.length === 0 ? "No matching source articles were found." : ""
  };
}
