let currentKanji = null;
let currentLevel = "N5";
let currentKanjiList = [];

function getRandomKanji() {
  if (currentKanjiList.length === 0) {
    return null;
  }
  const idx = Math.floor(Math.random() * currentKanjiList.length);
  return currentKanjiList[idx];
}

function showKanji() {
  currentKanji = getRandomKanji();

  if (currentKanji === null) {
    document.getElementById("kanji-character").textContent = "Error";
    document.getElementById("kanji-meaning").textContent = "No Kanji found for this level, or failed to load data.";
  } else {
    // Make the kanji character clickable for audio
    const kanjiCharEl = document.getElementById("kanji-character");
    kanjiCharEl.textContent = currentKanji.character;
    kanjiCharEl.title = "Click to hear pronunciation";
    kanjiCharEl.style.cursor = "pointer";
    
    document.getElementById("kanji-meaning").textContent = ""; // Clear previous meaning
  }
}

function showMeaning() {
  if (currentKanji && currentKanji.meaning && currentKanji.character !== "Error") {
    document.getElementById("kanji-meaning").textContent = currentKanji.meaning;
  }
}

// Function to speak the kanji reading aloud
function speakKanji() {
  if (currentKanji && currentKanji.readings && currentKanji.readings.length > 0) {
    const reading = currentKanji.readings[0]; // Use the first available reading
    
    // Check if speech synthesis is available
    if ('speechSynthesis' in window) {
      // Create a new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(reading);
      utterance.lang = 'ja-JP'; // Set language to Japanese
      
      // Speak the utterance
      window.speechSynthesis.speak(utterance);
      
      // Visual feedback that audio is playing
      const kanjiEl = document.getElementById("kanji-character");
      const originalColor = kanjiEl.style.color;
      kanjiEl.style.color = '#0078d7';
      
      utterance.onend = () => {
        kanjiEl.style.color = originalColor;
      };
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
  }
}

async function changeLevel(level) {
  currentLevel = level;
  document.getElementById("kanji-character").textContent = "Loading...";
  document.getElementById("kanji-meaning").textContent = "";

  try {
    // This relative URL will work in both development and production
    // - In local dev: it will call http://localhost:{port}/api/kanji?level={level}
    // - In production: it will call https://your-vercel-domain.com/api/kanji?level={level}
    const response = await fetch(`/api/kanji?level=${level}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    currentKanjiList = await response.json();
    if (currentKanjiList.length === 0) {
        console.warn(`No Kanji found for level ${level}. Displaying message.`);
        // Keep currentKanjiList as empty array
    }
  } catch (error) {
    console.error("Failed to fetch kanji data:", error);
    currentKanjiList = []; // Ensure list is empty on error
    // Error is handled in showKanji
  }
  showKanji();
}

document.getElementById("show-answer").addEventListener("click", showMeaning);
document.getElementById("next-kanji").addEventListener("click", showKanji);
document.getElementById("jlpt-level").addEventListener("change", function (e) {
  changeLevel(e.target.value);
});

// Replace the kanji character click listener with this
document.getElementById("play-audio").addEventListener("click", speakKanji);

// Initialize with a kanji
changeLevel(currentLevel);
