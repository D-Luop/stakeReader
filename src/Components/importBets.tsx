// components/importBets.tsx
import * as fs from 'fs';
import * as path from 'path';
import { Transform } from 'stream';
import { createReadStream } from 'fs';
import * as readline from 'readline';

export const importBetsFromFile = async (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const betsPath = path.join(__dirname, '..', 'api', 'Bets.json');
    
    // Check if the Bets.json file exists, create it if not
    if (!fs.existsSync(betsPath)) {
      fs.writeFileSync(betsPath, JSON.stringify([], null, 2));
    }
    
    // Read existing Bets into memory
    let existingBets: any[] = [];
    try {
      const fileContent = fs.readFileSync(betsPath, 'utf8');
      existingBets = JSON.parse(fileContent);
    } catch (error) {
      // If file exists but is invalid JSON, initialize as empty array
      existingBets = [];
    }
    
    let counter = 0;
    
    // For handling the complete file content
    let fileData = '';
    
    // Create read stream
    const readStream = createReadStream(filePath, { encoding: 'utf8' });
    
    // Read the file content
    readStream.on('data', (chunk) => {
      fileData += chunk;
    });
    
    readStream.on('end', () => {
      try {
        // Parse the complete JSON file
        const parsedData = JSON.parse(fileData);
        
        // Handle both array and object formats
        const newBets = Array.isArray(parsedData) ? parsedData : [parsedData];
        
        // Count the items
        counter = newBets.length;
        
        // Add to existing bets
        existingBets = [...existingBets, ...newBets];
        
        // Write back to file
        fs.writeFileSync(betsPath, JSON.stringify(existingBets, null, 2));
        
        resolve(counter);
      } catch (error) {
        reject(new Error(`Error parsing JSON file: ${(error as Error).message}`));
      }
    });
    
    readStream.on('error', (err) => {
      reject(err);
    });
  });
};