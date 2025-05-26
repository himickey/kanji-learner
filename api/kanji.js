// Vercel API route handler for Kanji data
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const level = req.query.level || 'N5';
  
  try {
    // ISSUE: In serverless environments like Vercel, file system access is readonly
    // and limited to the deployment bundle. The 'data' directory must be:
    // 1. Included in your git repository
    // 2. Located in the public directory for proper deployment
    // 3. Using path.join(process.cwd(), ...) which behaves differently in Vercel

    // SOLUTION: Use a path relative to the API handler location or use public directory
    // Option 1: Use public directory (recommended for Vercel)
    const dataPath = path.join(process.cwd(), 'public', 'data', `${level}.json`);
    
    // Option 2: Or use relative path from this file (can be inconsistent in serverless)
    // const dataPath = path.join(__dirname, '../public/data', `${level}.json`);
    
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const kanjiData = JSON.parse(fileData);
    
    // Send the data back as JSON
    res.status(200).json(kanjiData);
  } catch (error) {
    console.error(`Error fetching kanji for level ${level}:`, error);
    res.status(500).json({ error: `Failed to load kanji data for ${level}` });
  }
}
