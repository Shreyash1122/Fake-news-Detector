const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function analyzeNews(payload) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to analyze news content.");
  }

  return data;
}
