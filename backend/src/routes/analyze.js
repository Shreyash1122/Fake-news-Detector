import { Router } from "express";
import { analyzeCredibility, classifySourceStance } from "../services/analysisService.js";
import { buildAnalysisInput, fetchArticleFromUrl } from "../services/contentService.js";
import { fetchSourceCandidates } from "../services/sourceService.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { text = "", url = "", imageDataUrl = "" } = req.body || {};

    if (!text?.trim() && !url?.trim() && !imageDataUrl?.trim()) {
      return res.status(400).json({
        message: "Provide news text, URL, or an image screenshot to analyze."
      });
    }

    let fetchedText = "";
    let fetchedTitle = "";

    if (url?.trim()) {
      try {
        const fetched = await fetchArticleFromUrl(url.trim());
        fetchedText = fetched.extractedText;
        fetchedTitle = fetched.title;
      } catch (error) {
        fetchedText = "";
        fetchedTitle = "";
      }
    }

    const combinedInput = buildAnalysisInput({
      text,
      url,
      fetchedTitle,
      fetchedText
    });

    const analysis = await analyzeCredibility({
      combinedInput,
      imageDataUrl: imageDataUrl?.trim() || ""
    });

    const sourceCandidates = await fetchSourceCandidates(
      analysis.searchQueries?.length ? analysis.searchQueries : analysis.keyClaims
    );

    const stance = await classifySourceStance({
      claimContext: analysis.keyClaims?.join("; ") || analysis.explanation,
      sources: sourceCandidates.sources
    });

    return res.json({
      inputSummary: {
        hasText: Boolean(text?.trim()),
        hasUrl: Boolean(url?.trim()),
        hasImage: Boolean(imageDataUrl?.trim()),
        fetchedTitle
      },
      analysis,
      verification: {
        note: sourceCandidates.note,
        supportingArticles: stance.supporting,
        contradictingArticles: stance.contradicting
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
