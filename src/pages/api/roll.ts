import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from 'next-connect';

// Create a next-connect handler
const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  try {
    const wordsFilePath = path.join(process.cwd(), 'public', 'words.txt');
    const wordsData = fs.readFileSync(wordsFilePath, 'utf-8');
    const wordsArray = wordsData.split(',').map(word => word.trim()).filter(word => word);
    const randomWords = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * wordsArray.length);
      randomWords.push(wordsArray[randomIndex]);
    }
    res.status(200).json({ words: randomWords.join(', ') });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Disable body parsing, since we're using multer
export const config = {
  api: {
    bodyParser: true,
  },
};

export default router.handler();