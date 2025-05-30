let currentKanji = null;
let currentLevel = "N5";
let isMeaningVisible = false; // Track if meaning is currently shown

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
  document.getElementById("hiragana-text").textContent = "Loading..."; // Added this line
  
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

    // Populate Hiragana reading
    let hiraganaReading = null;
    if (currentKanji.readings && currentKanji.readings.length > 0) {
      hiraganaReading = currentKanji.readings[0];
    } else if (currentKanji.reading) {
      hiraganaReading = currentKanji.reading;
    } else if (currentKanji.hiragana) {
      hiraganaReading = currentKanji.hiragana;
    } else if (currentKanji.kana) {
      hiraganaReading = currentKanji.kana;
    } else if (currentKanji.furigana) {
      hiraganaReading = currentKanji.furigana;
    }

    const hiraganaTextEl = document.getElementById("hiragana-text");
    if (hiraganaReading) {
      hiraganaTextEl.textContent = hiraganaReading;
    } else {
      hiraganaTextEl.textContent = "-";
    }
    
    // If meaning was visible before, show it for the new kanji too
    if (isMeaningVisible) {
      updateMeaningDisplay();
    } else {
      document.getElementById("kanji-meaning").textContent = ""; // Clear previous meaning
    }
  }
}

function updateMeaningDisplay() {
  if (currentKanji && currentKanji.character !== "Error") {
    // Handle different possible property names from the API
    const meaning = currentKanji.meaning || currentKanji.meanings || currentKanji.definition || "No meaning available";
    document.getElementById("kanji-meaning").textContent = meaning;
  }
}

function toggleMeaning() {
  const showAnswerBtn = document.getElementById("show-answer");
  
  if (isMeaningVisible) {
    // Hide meaning
    isMeaningVisible = false;
    document.getElementById("kanji-meaning").textContent = "";
    showAnswerBtn.textContent = "Show Meaning";
  } else {
    // Show meaning
    isMeaningVisible = true;
    updateMeaningDisplay();
    showAnswerBtn.textContent = "Hide Meaning";
  }
}

// Function to speak the kanji reading aloud using Google Text-to-Speech
let isCurrentlyPlaying = false; // Prevent multiple simultaneous audio playbacks
let currentAudio = null; // Keep track of current audio instance

// Detect Safari browser
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Detect if we're on iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

async function speakKanji(event) {
  // Prevent event bubbling to avoid double triggers
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  // Double-check to prevent duplicate calls
  if (!currentKanji || isCurrentlyPlaying) {
    console.log('Audio already playing or no kanji loaded, skipping...');
    return;
  }
  
  console.log('Starting audio playback for:', currentKanji);
  console.log('Browser info:', { safari: isSafari(), iOS: isIOS() });
  isCurrentlyPlaying = true;
  
  // Stop any currently playing audio immediately
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  
  // Cancel any ongoing speech synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
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
  } else if (currentKanji.furigana) {
    reading = currentKanji.furigana;
  } else {
    // Fallback to the kanji/word itself
    reading = currentKanji.kanji || currentKanji.word || currentKanji.character;
  }
  
  if (!reading) {
    console.warn('No reading found for kanji');
    isCurrentlyPlaying = false;
    return;
  }
  
  console.log('Playing audio for reading:', reading);
  
  const kanjiEl = document.getElementById("kanji-character");
  const originalColor = kanjiEl.style.color || '#ffffff';
  
  // Create cleanup function to reset state
  const cleanup = () => {
    kanjiEl.style.color = originalColor;
    isCurrentlyPlaying = false;
    currentAudio = null;
    console.log('Audio playback cleanup completed');
  };
  
  // Enhanced fallback function with Safari support
  const fallbackToSpeechSynthesis = (reason) => {
    if ('speechSynthesis' in window) {
      console.log(`Falling back to browser speech synthesis: ${reason}`);
      
      // Ensure we're not blocked by the isCurrentlyPlaying flag
      if (!isCurrentlyPlaying) {
        isCurrentlyPlaying = true;
      }
      
      // Wait for voices to load (important for Safari)
      const waitForVoices = () => {
        return new Promise((resolve) => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve(voices);
          } else {
            // Wait for voiceschanged event (Safari needs this)
            window.speechSynthesis.onvoiceschanged = () => {
              resolve(window.speechSynthesis.getVoices());
            };
            
            // Timeout after 5 seconds if voices don't load
            setTimeout(() => {
              resolve(window.speechSynthesis.getVoices());
            }, 5000);
          }
        });
      };
      
      waitForVoices().then((voices) => {
        const utterance = new SpeechSynthesisUtterance(reading);
        utterance.lang = 'ja-JP';
        
        // Find Japanese voice if available
        const japaneseVoice = voices.find(voice => 
          voice.lang.startsWith('ja') || voice.name.includes('Japanese')
        );
        
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
          console.log('Using Japanese voice:', japaneseVoice.name);
        } else {
          console.log('No Japanese voice found, using default. Available voices:', voices.length);
        }
        
        // Safari-specific settings
        utterance.rate = 0.8; // Slower rate for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          console.log('Browser speech synthesis started');
          kanjiEl.style.color = '#0078d7';
        };
        
        utterance.onend = () => {
          console.log('Browser speech synthesis finished');
          cleanup();
        };
        
        utterance.onerror = (error) => {
          console.error('Browser speech synthesis failed:', error);
          cleanup();
        };
        
        // Use try-catch for Safari compatibility
        try {
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Failed to start speech synthesis:', error);
          cleanup();
        }
      }).catch((error) => {
        console.error('Failed to load voices:', error);
        cleanup();
      });
    } else {
      console.warn("Browser speech synthesis not available");
      cleanup();
    }
  };
  
  // For Safari and iOS, prefer Speech Synthesis API over external audio
  if (isSafari() || isIOS()) {
    console.log('Safari/iOS detected, using Speech Synthesis API directly');
    kanjiEl.style.color = '#ff9800'; // Loading state
    // Reset the flag before calling fallback for Safari/iOS direct usage
    isCurrentlyPlaying = false;
    fallbackToSpeechSynthesis('Safari/iOS optimization');
    return;
  }
  
  // Try our local TTS proxy first, then fallback to Speech Synthesis API
  try {
    // Set loading state
    kanjiEl.style.color = '#ff9800';
    
    // Use our local proxy to avoid CORS issues
    const ttsUrl = `/api/tts?text=${encodeURIComponent(reading)}&lang=ja`;
    
    // Create audio element
    const audio = new Audio();
    currentAudio = audio;
    
    // Set up event handlers before setting src
    audio.onloadstart = () => {
      console.log('Loading TTS audio via proxy...');
    };
    
    audio.oncanplay = () => {
      console.log('TTS audio ready to play');
      kanjiEl.style.color = '#0078d7';
    };
    
    audio.onended = () => {
      console.log('TTS audio finished normally');
      cleanup();
    };
    
    audio.onerror = (error) => {
      console.error('TTS proxy audio error:', error);
      console.log('Error details:', {
        code: audio.error?.code,
        message: audio.error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
      cleanup();
      fallbackToSpeechSynthesis('TTS proxy error');
    };
    
    // Set the source after event handlers are set up
    audio.src = ttsUrl;
    
    // Attempt to play the audio
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      await playPromise;
      console.log('TTS audio started playing');
    }
    
  } catch (error) {
    console.error('Failed to play TTS audio:', error);
    cleanup();
    fallbackToSpeechSynthesis('TTS play error');
  }
}

async function changeLevel(level) {
  currentLevel = level;
  document.getElementById("kanji-character").textContent = "Loading...";
  document.getElementById("kanji-meaning").textContent = "";

  // Reset button text when changing levels
  const showAnswerBtn = document.getElementById("show-answer");
  showAnswerBtn.textContent = isMeaningVisible ? "Hide Meaning" : "Show Meaning";

  // No need to pre-fetch data since we get random kanji on demand
  showKanji();
}

document.getElementById("show-answer").addEventListener("click", toggleMeaning);
document.getElementById("next-kanji").addEventListener("click", showKanji);
document.getElementById("jlpt-level").addEventListener("change", function (e) {
  changeLevel(e.target.value);
});

// Add audio event listener for kanji character click
document.getElementById("kanji-character").addEventListener("click", speakKanji);

// Initialize with a kanji
changeLevel(currentLevel);
