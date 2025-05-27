let currentKanji = null;
let currentLevel = "N5";

// Map JLPT levels to API numeric values
const levelMapping = {
  "N5": "5",
  "N4": "4", 
  "N3": "3",
  "N2": "2",
  "N1": "1"
};

// Function to fetch a random kanji from the API
async function getRandomKanji() {
  try {
    const apiLevel = levelMapping[currentLevel] || "5";
    const response = await fetch(`https://jlpt-vocab-api-khaki.vercel.app/api/words/random?level=${apiLevel}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch kanji data:", error);
    return null;
  }
}

async function showKanji() {
  document.getElementById("kanji-character").textContent = "Loading...";
  document.getElementById("kanji-meaning").textContent = "";
  
  currentKanji = await getRandomKanji();

  if (currentKanji === null) {
    document.getElementById("kanji-character").textContent = "Error";
    document.getElementById("kanji-meaning").textContent = "Failed to load kanji data.";
  } else {
    // Make the kanji character clickable for audio
    const kanjiCharEl = document.getElementById("kanji-character");
    // Use the kanji property or word property depending on API response structure
    const kanjiText = currentKanji.kanji || currentKanji.word || currentKanji.character || "?";
    kanjiCharEl.textContent = kanjiText;
    kanjiCharEl.title = "Click to hear pronunciation";
    kanjiCharEl.style.cursor = "pointer";
    
    document.getElementById("kanji-meaning").textContent = ""; // Clear previous meaning
  }
}

function showMeaning() {
  if (currentKanji && currentKanji.character !== "Error") {
    // Handle different possible property names from the API
    const meaning = currentKanji.meaning || currentKanji.meanings || currentKanji.definition || "No meaning available";
    document.getElementById("kanji-meaning").textContent = meaning;
  }
}

// Function to speak the kanji reading aloud using Google Text-to-Speech
async function speakKanji() {
  if (currentKanji) {
    // Handle different possible property names for readings
    let reading = null;
    
    if (currentKanji.readings && currentKanji.readings.length > 0) {
      reading = currentKanji.readings[0];
    } else if (currentKanji.reading) {
      reading = currentKanji.reading;
    } else if (currentKanji.hiragana) {
      reading = currentKanji.hiragana;
    } else if (currentKanji.kana) {
      reading = currentKanji.kana;
    } else {
      // Fallback to the kanji/word itself
      reading = currentKanji.kanji || currentKanji.word || currentKanji.character;
    }
    
    if (reading) {
      try {
        // Visual feedback that audio is loading/playing
        const kanjiEl = document.getElementById("kanji-character");
        const audioBtn = document.getElementById("play-audio");
        const originalColor = kanjiEl.style.color;
        
        // Set loading state
        kanjiEl.style.color = '#ff9800';
        if (audioBtn) {
          audioBtn.classList.add('loading');
          audioBtn.textContent = '⏳';
        }
        
        // Use Google Translate's TTS service
        // This creates a URL that returns an audio file from Google's TTS
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(reading)}`;
        
        // Create and play audio element
        const audio = new Audio(ttsUrl);
        
        // Handle audio events
        audio.onloadstart = () => {
          console.log('Loading Google TTS audio...');
        };
        
        audio.oncanplay = () => {
          console.log('Google TTS audio ready to play');
          // Set playing state
          kanjiEl.style.color = '#0078d7';
          if (audioBtn) {
            audioBtn.classList.remove('loading');
            audioBtn.classList.add('playing');
            audioBtn.textContent = '▶️';
          }
        };
        
        audio.onended = () => {
          kanjiEl.style.color = originalColor;
          if (audioBtn) {
            audioBtn.classList.remove('loading', 'playing');
            audioBtn.textContent = '🔊';
          }
          console.log('Google TTS audio finished');
        };
        
        audio.onerror = (error) => {
          console.error('Google TTS audio error:', error);
          kanjiEl.style.color = originalColor;
          if (audioBtn) {
            audioBtn.classList.remove('loading', 'playing');
            audioBtn.textContent = '🔊';
          }
          
          // Fallback to browser speech synthesis
          if ('speechSynthesis' in window) {
            console.log('Falling back to browser speech synthesis');
            const utterance = new SpeechSynthesisUtterance(reading);
            utterance.lang = 'ja-JP';
            utterance.onend = () => {
              kanjiEl.style.color = originalColor;
            };
            window.speechSynthesis.speak(utterance);
          }
        };
        
        // Play the audio
        await audio.play();
        
      } catch (error) {
        console.error('Failed to play Google TTS audio:', error);
        
        // Reset visual states
        const kanjiEl = document.getElementById("kanji-character");
        const audioBtn = document.getElementById("play-audio");
        const originalColor = kanjiEl.style.color;
        kanjiEl.style.color = originalColor;
        if (audioBtn) {
          audioBtn.classList.remove('loading', 'playing');
          audioBtn.textContent = '🔊';
        }
        
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          console.log('Falling back to browser speech synthesis');
          const utterance = new SpeechSynthesisUtterance(reading);
          utterance.lang = 'ja-JP';
          utterance.onend = () => {
            kanjiEl.style.color = originalColor;
          };
          window.speechSynthesis.speak(utterance);
        } else {
          console.warn("Neither Google TTS nor browser speech synthesis available");
        }
      }
    }
  }
}

async function changeLevel(level) {
  currentLevel = level;
  document.getElementById("kanji-character").textContent = "Loading...";
  document.getElementById("kanji-meaning").textContent = "";

  // No need to pre-fetch data since we get random kanji on demand
  showKanji();
}

document.getElementById("show-answer").addEventListener("click", showMeaning);
document.getElementById("next-kanji").addEventListener("click", showKanji);
document.getElementById("jlpt-level").addEventListener("change", function (e) {
  changeLevel(e.target.value);
});

// Add audio event listeners for both kanji character and audio button
document.getElementById("kanji-character").addEventListener("click", speakKanji);
document.getElementById("play-audio").addEventListener("click", speakKanji);

// Initialize with a kanji
changeLevel(currentLevel);
