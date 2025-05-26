let currentKanji = null;
let currentLevel = "N5";
let currentKanjiList = [];

function getRandomKanji() {
  if (currentKanjiList.length === 0) {
    return { character: "Loading...", meaning: "Please wait" };
  }
  const idx = Math.floor(Math.random() * currentKanjiList.length);
  return currentKanjiList[idx];
}

function showKanji() {
  currentKanji = getRandomKanji();
  document.getElementById("kanji-character").textContent = currentKanji.character;
  document.getElementById("kanji-meaning").textContent = ""; // Clear previous meaning

  if (currentKanjiList.length === 0 && currentKanji.character !== "Loading...") {
     document.getElementById("kanji-character").textContent = "Error";
     document.getElementById("kanji-meaning").textContent = "Failed to load Kanji data.";
  }
}

function showMeaning() {
  if (currentKanji && currentKanji.meaning !== "Please wait" && currentKanji.meaning !== "Failed to load Kanji data.") {
    document.getElementById("kanji-meaning").textContent = currentKanji.meaning;
  }
}

async function changeLevel(level) {
  currentLevel = level;
  document.getElementById("kanji-character").textContent = "Loading...";
  document.getElementById("kanji-meaning").textContent = "";

  try {
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

// Initialize with a kanji
changeLevel(currentLevel);
