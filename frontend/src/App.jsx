import { useMemo, useState } from "react";
import { analyzeNews } from "./api";

const scoreColor = (score) => {
  if (score >= 75) return "text-emerald-300";
  if (score >= 45) return "text-amber-300";
  return "text-rose-300";
};

const verdictStyles = {
  Verified: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  "Possibly True": "bg-amber-500/20 text-amber-200 border-amber-400/40",
  "Likely Fake": "bg-rose-500/20 text-rose-200 border-rose-400/40"
};

function ScoreRow({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className={scoreColor(value)}>{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SourceList({ title, items, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h4 className={`mb-3 text-sm font-semibold ${accent}`}>{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No results found.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.url} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <a className="font-medium text-cyan-300 hover:underline" href={item.url} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              <p className="mt-1 text-xs text-slate-400">
                {item.source} {item.publishedAt ? `| ${new Date(item.publishedAt).toLocaleDateString()}` : ""}
              </p>
              <p className="mt-2 text-sm text-slate-300">{item.reason || item.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnalysisCard({ result }) {
  const analysis = result.analysis;
  const verification = result.verification;
  const style = verdictStyles[analysis.verdict] || verdictStyles["Possibly True"];

  return (
    <div className="space-y-5 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${style}`}>{analysis.verdict}</div>
        <p className="text-2xl font-bold tracking-tight text-white">Credibility Score: {analysis.credibilityScore}/100</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ScoreRow label="Language Authenticity" value={analysis.breakdown.languageAuthenticity} />
        <ScoreRow label="Source Reliability" value={analysis.breakdown.sourceReliability} />
        <ScoreRow label="Fact Consistency" value={analysis.breakdown.factConsistency} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="mb-2 text-sm uppercase tracking-wide text-slate-400">Explainable AI Summary</h3>
        <p className="text-slate-200">{analysis.explanation}</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="mb-2 text-sm uppercase tracking-wide text-slate-400">Detected Signals</h3>
        <p className="text-sm text-slate-300">
          Clickbait Risk: <span className="font-semibold text-slate-100">{analysis.signals.clickbaitRisk}</span> | Bias:
          <span className="font-semibold text-slate-100"> {analysis.signals.biasLevel}</span> | Logical Consistency:
          <span className="font-semibold text-slate-100"> {analysis.signals.logicalConsistency}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="mb-2 text-sm uppercase tracking-wide text-slate-400">Key Claims Extracted</h3>
        {analysis.keyClaims.length === 0 ? (
          <p className="text-sm text-slate-400">No clear fact claims extracted.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-slate-200">
            {analysis.keyClaims.map((claim) => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
        )}
      </div>

      {verification.note ? <p className="text-sm text-amber-200">{verification.note}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <SourceList title="Supporting Articles" items={verification.supportingArticles || []} accent="text-emerald-300" />
        <SourceList title="Contradicting Articles" items={verification.contradictingArticles || []} accent="text-rose-300" />
      </div>
    </div>
  );
}

export default function App() {
  const [newsText, setNewsText] = useState("");
  const [newsUrl, setNewsUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const latest = useMemo(() => history[0] || null, [history]);

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setImageDataUrl("");
      setUploadedFileName("");
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    if (!newsText.trim() && !newsUrl.trim() && !imageDataUrl.trim()) {
      setError("Paste news text, provide a URL, or upload a screenshot.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await analyzeNews({
        text: newsText.trim(),
        url: newsUrl.trim(),
        imageDataUrl: imageDataUrl.trim()
      });

      setHistory((current) => [
        {
          id: Date.now(),
          input: {
            text: newsText.trim(),
            url: newsUrl.trim(),
            imageName: uploadedFileName
          },
          result
        },
        ...current
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-slate-100 md:px-8">
      <header className="mb-8 space-y-3 text-center">
        <p className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
          AI Fake News Detector
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Credibility Checker Chatbot</h1>
        <p className="mx-auto max-w-2xl text-slate-300">
          Paste a headline/article, add a URL, or upload a screenshot. We analyze language, score credibility, and
          cross-check with external sources.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <form onSubmit={handleAnalyze} className="space-y-4 rounded-3xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-soft backdrop-blur">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">News Text / Headline</span>
            <textarea
              className="h-40 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="Paste the article content or headline here..."
              value={newsText}
              onChange={(event) => setNewsText(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Article URL (optional)</span>
            <input
              type="url"
              value={newsUrl}
              onChange={(event) => setNewsUrl(event.target.value)}
              placeholder="https://example.com/news"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Upload Screenshot (bonus)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-xl border border-dashed border-slate-600 bg-slate-950 px-4 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-cyan-100"
            />
            {uploadedFileName ? <p className="text-xs text-slate-400">Attached: {uploadedFileName}</p> : null}
          </label>

          {error ? <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Credibility"}
          </button>
        </form>

        <section className="space-y-4">
          {latest ? (
            <>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-200">Latest Input</p>
                {latest.input.text ? <p className="mt-2 text-slate-300">{latest.input.text}</p> : null}
                {latest.input.url ? <p className="mt-2 text-cyan-300">URL: {latest.input.url}</p> : null}
                {latest.input.imageName ? <p className="mt-2 text-slate-400">Screenshot: {latest.input.imageName}</p> : null}
              </div>
              <AnalysisCard result={latest.result} />
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-400">
              Your credibility report will appear here after the first analysis.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
