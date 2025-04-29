// routes/fileUpload.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cb(null, `${timestamp}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Data file paths
const dataFiles = {
  bets: path.join(__dirname, '..', 'bets.json'),
  transactions: path.join(__dirname, '..', 'transactions.json')
};

// Provider name mapping
const providerMapping = {
  'pragmatic': 'Pragmatic Play',
  'twist': 'Massive Studios',
  'hacksaw': 'Hacksaw',
  'hacksawgaming': 'Hacksaw',
  'evolutionoss': 'NoLimit City',
  'relax': 'Relax Gaming',
  'relaxgaming': 'Relax Gaming',
  'pg': 'PG Soft',
  'pgsoft': 'PG Soft',
  'redtiger': 'Red Tiger',
  'netent': 'NetEnt',
  'playngo': 'Play\'n GO',
  'nolimit': 'NoLimit City',
  'nolimitcity': 'NoLimit City',
  'push': 'Push Gaming',
  'pushgaming': 'Push Gaming',
  'evo': 'Evolution',
  'evolution': 'Evolution',
  'blueprint': 'Blueprint Gaming',
  'thunderkick': 'Thunderkick',
  'rtg': 'Realtime Gaming',
  'quickspin': 'Quickspin',
  'bigtime': 'Big Time Gaming',
  'bigtimegaming': 'Big Time Gaming',
  'betsoft': 'Betsoft',
  'fugaso': 'Fugaso',
  'gameart': 'GameArt',
  'habanero': 'Habanero',
  'isoftbet': 'iSoftBet',
  'wazdan': 'Wazdan',
  'tomhorn': 'Tom Horn',
  'booongo': 'Booongo',
  'bgaming': 'BGaming',
  'igtech': 'IGTech',
  'spinomenal': 'Spinomenal',
  'ktr': 'KA Gaming',
  'kagaming': 'KA Gaming',
  'playson': 'Playson',
  'evoplay': 'Evoplay',
  'yggdrasil': 'Yggdrasil',
  'kalamba': 'Kalamba',
  'novomatic': 'Novomatic',
  'platipus': 'Platipus',
  'reelplay': 'ReelPlay',
  'trulab': 'TruLab',
  'elk': 'ELK Studios',
  'elkstudios': 'ELK Studios',
  'playtech': 'Playtech',
  'merkur': 'Merkur Gaming',
  'amatic': 'Amatic',
  // Add more mappings as needed
};

// Helper function to standardize provider names
function standardizeProviderName(providerName) {
  if (!providerName) return 'Unknown';
  
  const lowerProvider = providerName.toLowerCase().trim();
  
  // Check direct match in mapping
  if (providerMapping[lowerProvider]) {
    return providerMapping[lowerProvider];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(providerMapping)) {
    if (lowerProvider.includes(key)) {
      return value;
    }
  }
  
  // If no match, capitalize first letter of each word
  return providerName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to read and parse a JSON file
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Helper function to write data to a JSON file
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

// Helper function to parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  return lines.map(line => {
    // Replace any instances of double quotes that might interfere with parsing
    const cleanLine = line.replace(/"/g, '');
    
    // Split the line by commas, but be careful with GMT format dates
    const columns = [];
    let currentCol = '';
    let inGMTString = false;
    
    for (let i = 0; i < cleanLine.length; i++) {
      const char = cleanLine[i];
      
      // If we see "GMT", we're in a date string and should ignore commas until we see ")"
      if (cleanLine.substring(i, i + 3) === 'GMT') {
        inGMTString = true;
      }
      
      if (char === ',' && !inGMTString) {
        // End of a column
        columns.push(currentCol.trim());
        currentCol = '';
      } else {
        currentCol += char;
        
        // If we see the closing parenthesis after GMT, we're done with the date
        if (inGMTString && char === ')') {
          inGMTString = false;
        }
      }
    }
    
    // Don't forget to add the last column
    if (currentCol) {
      columns.push(currentCol.trim());
    }
    
    return columns;
  });
}


// Upload transaction files (deposits/withdrawals)
router.post('/transactions', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded.' 
      });
    }
    
    // Get fileType param (deposit or withdraw)
    const fileType = req.body.fileType;
    if (!fileType || (fileType !== 'deposit' && fileType !== 'withdraw')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type. Please specify "deposit" or "withdraw".'
      });
    }
    
    let existingTransactions = readJsonFile(dataFiles.transactions);
    let totalTransactionsAdded = 0;
    let skippedEntries = 0;
    let duplicatesSkipped = 0;
    let invalidFiles = [];
    
    // Process each uploaded file
    for (const file of req.files) {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        let uploadedTransactions = [];
        
        // Check if it's a CSV file by extension or content
        if (file.originalname.toLowerCase().endsWith('.csv') || 
            (fileContent.includes(',') && !fileContent.includes('{'))) {
          
          // Parse the CSV content
          const parsedRows = parseCSV(fileContent);
          
          // Skip header row if it exists (check if first row looks like a header)
          const dataRows = parsedRows[0][0].toLowerCase().includes('time') || 
                           parsedRows[0][0].toLowerCase().includes('date') ? 
                           parsedRows.slice(1) : parsedRows;
          
          // Process each row as a transaction
          uploadedTransactions = dataRows.map((row, index) => {
            try {
              /*
                Expected CSV format for both deposits and withdrawals:
                0: Created time (GMT)
                1: Completed time (GMT)
                2: Amount (negative for withdrawals, positive for deposits)
                3: Currency
                4: Transaction ID
                5: Status
                6: Fee
                7: Total
                8: Note or dash
              */
              
              // Skip if row doesn't have enough columns
              if (row.length < 5 || row[5] == 'failed') {
                skippedEntries++;
                return null;
              }
              
              // Extract data from the row
              const createdTime = new Date(row[0]).getTime();
              const completedTime = new Date(row[1]).getTime();
              // Amount is always stored as positive, regardless of deposit/withdraw
              const amount = Math.abs(parseFloat(row[2] || 0));
              const currency = row[3] || 'USD';
              const transactionId = row[4] || '';
              const status = row[5] || 'completed';
              const fee = parseFloat(row[6] || 0);
              const total = parseFloat(row[7] || amount);
              const note = row[8] || '';
              
              // Create a unique ID using the transaction ID if available
              const uniqueId = transactionId ? 
                `tx-${transactionId}` : 
                `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

              if (status.toLowerCase() != 'successful') {
                skippedEntries++;
                return null;
              }
              
              // Create the transaction object
              return {
                id: uniqueId,
                type: fileType, // Use the uploaded file type (from the button)
                data: {
                  amount: amount,
                  status: status === 'Successful' ? 'completed' : status.toLowerCase(),
                  currency: currency,
                  fee: fee,
                  total: total,
                  transactionId: transactionId,
                  method: 'csv-import',
                  note: note,
                  createdAt: createdTime,
                  completedAt: completedTime
                },
                created_at: new Date(createdTime).toISOString(),
                updated_at: new Date(completedTime).toISOString()
              };
            } catch (rowErr) {
              console.error(`Error processing CSV row ${index}:`, rowErr);
              skippedEntries++;
              return null;
            }
          }).filter(tx => tx !== null);
          
        } else {
          // Try to handle it as JSON
          try {
            validateJsonContent(fileContent, file.originalname);
            const jsonData = JSON.parse(fileContent);
            
            // Ensure it's an array
            const jsonTransactions = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            // Process JSON transactions
            uploadedTransactions = jsonTransactions.map(transaction => {
              // Skip if it's not a proper transaction entry
              if (!transaction || (!transaction.data && !transaction.amount)) {
                skippedEntries++;
                return null;
              }
              
              try {
                let txData = transaction.data || transaction;
                let amount = 0;
                
                // Determine amount based on transaction type and available fields
                if (fileType === 'deposit') {
                  amount = parseFloat(txData.depositAmount || 
                                  txData.amount || 
                                  transaction.amount || 0);
                } else {
                  amount = parseFloat(txData.withdrawAmount || 
                                  txData.amount || 
                                  transaction.amount || 0);
                }
                
                // Create a standardized transaction object
                return {
                  id: transaction.id || transaction._id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  type: fileType,
                  data: {
                    amount: Math.abs(amount), // Ensure positive amount
                    status: txData.status || 'completed',
                    currency: txData.currency || 'USD',
                    method: txData.method || txData.paymentMethod || 'unknown',
                    createdAt: txData.createdAt || txData.timestamp || transaction.created_at || Date.now(),
                    completedAt: txData.completedAt || txData.timestamp || transaction.updated_at || Date.now()
                  },
                  created_at: transaction.created_at || txData.createdAt || new Date().toISOString(),
                  updated_at: transaction.updated_at || txData.updatedAt || new Date().toISOString()
                };
              } catch (err) {
                console.error('Error processing JSON transaction:', err);
                skippedEntries++;
                return null;
              }
            }).filter(tx => tx !== null);
          } catch (jsonError) {
            console.error(`Error parsing file as JSON: ${file.originalname}`, jsonError);
            invalidFiles.push({
              name: file.originalname,
              error: `Not a valid CSV or JSON file: ${jsonError.message}`
            });
            continue; // Skip to next file
          }
        }
        
        // Add to existing transactions - Prevent duplicates by checking IDs
        const existingTxIds = new Set(existingTransactions.map(tx => tx.id));
        const uniqueNewTransactions = uploadedTransactions.filter(tx => !existingTxIds.has(tx.id));
        
        // Count duplicates that were skipped
        duplicatesSkipped += uploadedTransactions.length - uniqueNewTransactions.length;
        
        // Add new transactions
        existingTransactions = [...existingTransactions, ...uniqueNewTransactions];
        totalTransactionsAdded += uniqueNewTransactions.length;
        
        // Remove the temp file
        fs.unlinkSync(file.path);
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        invalidFiles.push({
          name: file.originalname,
          error: fileError.message
        });
      }
    }
    
    // If all files were invalid
    if (invalidFiles.length === req.files.length) {
      return res.status(400).json({
        success: false,
        message: 'All uploaded files were invalid.',
        invalidFiles: invalidFiles
      });
    }
    
    // Write the updated transactions
    if (writeJsonFile(dataFiles.transactions, existingTransactions)) {
      res.json({
        success: true,
        message: `Successfully added ${totalTransactionsAdded} ${fileType}s from ${req.files.length - invalidFiles.length} files.`,
        skipped: skippedEntries,
        duplicatesSkipped: duplicatesSkipped,
        totalTransactions: existingTransactions.length,
        invalidFiles: invalidFiles.length > 0 ? invalidFiles : undefined,
        shouldRefresh: true // Signal to the frontend that it should refresh data
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Error saving ${fileType} data.` 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Upload bet files
router.post('/bets', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded.' 
      });
    }
    
    let existingBets = readJsonFile(dataFiles.bets);
    let totalBetsAdded = 0;
    let skippedEntries = 0;
    
    // Process each uploaded file
    for (const file of req.files) {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        let uploadedBets = JSON.parse(fileContent);
        
        // Ensure uploadedBets is an array
        if (!Array.isArray(uploadedBets)) {
          uploadedBets = [uploadedBets];
        }
        
        // Extract only essential data and standardize provider names
        uploadedBets = uploadedBets.map(bet => {
          // Skip if it's not a proper bet entry
          if (!bet || !bet.data) {
            skippedEntries++;
            return null;
          }
          
          try {
            // Extract only the fields we need
            const extractedBet = {
              id: bet.id || bet._id || `bet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              data: {
                gameName: bet.data.gameName || bet.data.game || 'Unknown Game',
                amount: parseFloat(bet.data.amount || bet.data.betAmount || 0),
                payout: parseFloat(bet.data.payout || bet.data.winAmount || 0),
                provider: standardizeProviderName(bet.data.provider || 'Unknown'),
                createdAt: bet.data.createdAt || bet.data.timestamp || bet.created_at || Date.now()
              },
              created_at: bet.created_at || bet.timestamp || bet.data.createdAt || new Date().toISOString()
            };
            
            return extractedBet;
          } catch (err) {
            console.error('Error processing bet:', err);
            skippedEntries++;
            return null;
          }
        }).filter(bet => bet !== null); // Remove null entries
        
        // Add to existing bets
        existingBets = [...existingBets, ...uploadedBets];
        totalBetsAdded += uploadedBets.length;
        
        // Remove the temp file
        fs.unlinkSync(file.path);
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
      }
    }
    
    // Write the updated bets
    if (writeJsonFile(dataFiles.bets, existingBets)) {
      res.json({
        success: true,
        message: `Successfully added ${totalBetsAdded} bets from ${req.files.length} files.`,
        skipped: skippedEntries,
        totalBets: existingBets.length
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error saving bet data.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get route - for testing
router.get('/', (req, res) => {
  res.json({
    message: 'File upload API is working',
    endpoints: {
      bets: '/api/upload/bets',
      transactions: '/api/upload/transactions'
    }
  });
});

module.exports = router;