const kanjiLevels = {
  N5: [
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
  ],
  N4: [
    { character: "世", meaning: "world, generation" },
    { character: "主", meaning: "master, main" },
    { character: "仕", meaning: "serve, do" },
    { character: "他", meaning: "other" },
    { character: "代", meaning: "substitute, generation" }
  ],
  N3: [
    { character: "億", meaning: "hundred million" },
    { character: "加", meaning: "add" },
    { character: "仮", meaning: "temporary" },
    { character: "価", meaning: "value" },
    { character: "河", meaning: "river" }
  ],
  N2: [
    { character: "圧", meaning: "pressure" },
    { character: "移", meaning: "shift, move" },
    { character: "因", meaning: "cause, factor" },
    { character: "永", meaning: "eternity" },
    { character: "営", meaning: "manage, operate" }
  ],
  N1: [
    { character: "曖", meaning: "unclear" },
    { character: "握", meaning: "grip, hold" },
    { character: "扱", meaning: "handle, deal with" },
    { character: "宛", meaning: "address, direct to" },
    { character: "嵐", meaning: "storm" }
  ]
};

let currentKanji = null;
let currentLevel = "N5";
let currentKanjiList = kanjiLevels[currentLevel];

function getRandomKanji() {
  const idx = Math.floor(Math.random() * currentKanjiList.length);
  return currentKanjiList[idx];
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

function changeLevel(level) {
  currentLevel = level;
  currentKanjiList = kanjiLevels[currentLevel];
  showKanji();
}

document.getElementById("show-answer").addEventListener("click", showMeaning);
document.getElementById("next-kanji").addEventListener("click", showKanji);
document.getElementById("jlpt-level").addEventListener("change", function (e) {
  changeLevel(e.target.value);
});

// Initialize with a kanji
showKanji();
