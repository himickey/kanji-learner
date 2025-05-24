const kanjiList = [
  { character: "日", meaning: "sun, day" },
  { character: "月", meaning: "moon, month" },
  { character: "火", meaning: "fire" },
  { character: "水", meaning: "water" },
  { character: "木", meaning: "tree, wood" },
  { character: "金", meaning: "gold, money" },
  { character: "土", meaning: "earth, soil" },
  { character: "山", meaning: "mountain" },
  { character: "川", meaning: "river" },
  { character: "田", meaning: "rice field" }
];

let currentKanji = null;

function getRandomKanji() {
  const idx = Math.floor(Math.random() * kanjiList.length);
  return kanjiList[idx];
}

function showKanji() {
  currentKanji = getRandomKanji();
  document.getElementById("kanji-character").textContent = currentKanji.character;
  document.getElementById("kanji-meaning").textContent = "";
}

function showMeaning() {
  if (currentKanji) {
    document.getElementById("kanji-meaning").textContent = currentKanji.meaning;
  }
}

document.getElementById("show-answer").addEventListener("click", showMeaning);
document.getElementById("next-kanji").addEventListener("click", showKanji);

// Initialize with a kanji
showKanji();
