const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());

const levelToFile = {
  N5: "n5-vocab-kanji-eng.anki.html",
  N4: "n4-vocab-kanji-eng.anki.html",
  N3: "n3-vocab-kanji-eng.anki.html",
  N2: "n2-vocab-kanji-eng.anki.html",
  N1: "n1-vocab-kanji-eng.anki.html"
};

function extractTextFromSpan(str) {
  // Extracts text between > and </span>
  const match = str.match(/>(.*?)<\/span>/);
  return match ? match[1] : str;
}

app.get("/api/kanji", async (req, res) => {
  const level = req.query.level || "N5";
  const fileName = levelToFile[level] || levelToFile["N5"];
  const filePath = path.join(
    __dirname,
    "node_modules",
    "jlpt-vocab-api",
    "data-source",
    "tabs",
    fileName
  );

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const lines = data.split("\n").slice(1); // skip header
    const kanjiList = lines
      .map(line => {
        const [kanjiSpan, meaningSpan] = line.split("\t");
        if (!kanjiSpan || !meaningSpan) return null;
        return {
          character: extractTextFromSpan(kanjiSpan),
          meaning: extractTextFromSpan(meaningSpan)
        };
      })
      .filter(Boolean);
    res.json(kanjiList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch kanji" });
  }
});

app.listen(PORT, () => {
  console.log(`Kanji API server running on http://localhost:${PORT}`);
});
