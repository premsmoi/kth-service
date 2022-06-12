import fs from 'fs';
import readline from 'readline';

const filePath = 'words.txt';
const words: string[] = [];

export const readFile = async () => {
    const fileStream = fs.createReadStream(filePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const word of rl) {
      // Each line in input.txt will be successively available here as `line`.
      // console.log(`Line from file: ${line}`);
      words.push(word);
    }
  
    console.log({ wordCount: words.length });
};

export const randomWord = () => {
    const index = Math.round(Math.random() * words.length);

    return words[index];
};
