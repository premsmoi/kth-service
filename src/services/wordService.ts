import fs from 'fs';
import readline from 'readline';

const filePath = './words.txt';
let words: string[] = [];

export const readFile = async () => {
    const fileStream = fs.createReadStream(filePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
  
    for await (const text of rl) {
      words = text.split(',');
    }
  
    console.log({ wordCount: words.length });
};

export const randomWord = () => {
    const index = Math.round(Math.random() * words.length);

    return words[index];
};
