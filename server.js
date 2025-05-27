const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(cors());

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy endpoint for Google TTS to avoid CORS issues
app.get('/api/tts', (req, res) => {
  const text = req.query.text;
  const lang = req.query.lang || 'ja';
  
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }
  
  const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}&textlen=${text.length}`;
  
  console.log(`Proxying TTS request for: "${text}" in ${lang}`);
  
  // Make request to Google TTS
  https.get(googleTTSUrl, (googleRes) => {
    if (googleRes.statusCode !== 200) {
      console.error('Google TTS error:', googleRes.statusCode);
      return res.status(500).json({ error: 'Failed to fetch audio from Google TTS' });
    }
    
    // Set appropriate headers for audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Pipe the audio data through
    googleRes.pipe(res);
  }).on('error', (error) => {
    console.error('Google TTS request error:', error);
    res.status(500).json({ error: 'Failed to connect to Google TTS service' });
  });
});

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
  console.log(`Kanji API server running on port ${PORT}`);
});
