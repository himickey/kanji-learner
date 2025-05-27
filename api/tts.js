// Vercel API route for TTS proxy to avoid CORS issues
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { text, lang = 'ja' } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }
  
  try {
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}&textlen=${text.length}`;
    
    console.log(`Proxying TTS request for: "${text}" in ${lang}`);
    
    // Fetch audio from Google TTS
    const response = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('Google TTS error:', response.status);
      return res.status(500).json({ error: 'Failed to fetch audio from Google TTS' });
    }
    
    // Get the audio data as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate headers for audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the audio data
    res.send(Buffer.from(audioBuffer));
    
  } catch (error) {
    console.error('TTS proxy error:', error);
    res.status(500).json({ error: 'Failed to connect to Google TTS service' });
  }
}
