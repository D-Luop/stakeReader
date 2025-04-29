// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();

// Middleware
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Add timestamp to filename to prevent overwrites
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cb(null, `${timestamp}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Ensure data files exist
const dataFiles = {
  bets: path.join(__dirname, 'bets.json'),
  transactions: path.join(__dirname, 'transactions.json')
};

// Initialize data files if they don't exist
Object.values(dataFiles).forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
});

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
  'betradar': 'Betradar'
};

// Helper function to standardize provider names
function standardizeProviderName(providerName) {
  if (!providerName || providerName === 'Unknown') return 'Stake Originals';
  
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
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
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

// Helper function to validate JSON content before parsing
function validateJsonContent(fileContent, filename) {
  // Check if the content looks like HTML/XML
  if (fileContent.trim().startsWith('<!DOCTYPE') || 
      fileContent.trim().startsWith('<html') || 
      fileContent.trim().startsWith('<?xml')) {
    throw new Error(`File "${filename}" appears to be HTML or XML, not valid JSON`);
  }
  
  // Try to parse the JSON
  try {
    JSON.parse(fileContent);
    return true;
  } catch (error) {
    // Provide more specific error message based on the error
    if (error.message.includes('Unexpected token')) {
      throw new Error(`Invalid JSON in "${filename}": ${error.message}`);
    } else {
      throw new Error(`Error parsing "${filename}": ${error.message}`);
    }
  }
}

const fileUploadRoutes = require('./routes/fileUpload');
app.use('/api/upload', fileUploadRoutes);

// Upload bet files
app.post('/api/upload/bets', upload.array('files', 10), (req, res) => {
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
    let duplicatesSkipped = 0;
    let invalidFiles = [];
    
    // Process each uploaded file
    for (const file of req.files) {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        
        // Validate JSON content before parsing
        try {
          validateJsonContent(fileContent, file.originalname);
        } catch (validationError) {
          invalidFiles.push({
            name: file.originalname,
            error: validationError.message
          });
          continue; // Skip this file and move to the next one
        }
        
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
            // Determine bet type (slots or sports)
            let betType = 'slots'; // Default to slots
            
            // Check if it's a sports bet based on specific game names or other properties
            if (bet.data.sport || 
                bet.data.sportId || 
                bet.data.leagueId || 
                bet.data.type === 'sportsbook' || 
                (bet.data.gameName && 
                 (bet.data.gameName.toLowerCase().includes('sport') || 
                  bet.data.gameName.toLowerCase().includes('sportsbook'))) ||
                (bet.data.iid && bet.data.iid.toLowerCase().includes('sport'))) {
              betType = 'sports';
            }
            
            // For sports bets, preserve more detailed data
            if (betType === 'sports') {
              // Extract primary provider from outcomes if available
              let provider = 'Unknown';
              if (bet.data.outcomes && bet.data.outcomes.length > 0) {
                const providers = bet.data.outcomes
                  .map(o => o.provider)
                  .filter(p => p);
                  
                if (providers.length > 0) {
                  // Get most common provider
                  const providerCounts = {};
                  let maxCount = 0;
                  let mostCommonProvider = providers[0];
                  
                  providers.forEach(p => {
                    providerCounts[p] = (providerCounts[p] || 0) + 1;
                    if (providerCounts[p] > maxCount) {
                      maxCount = providerCounts[p];
                      mostCommonProvider = p;
                    }
                  });
                  
                  provider = standardizeProviderName(mostCommonProvider);
                }
              }
              
              // Create a more complete sports bet object
              return {
                id: bet.id || bet._id || `bet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: betType,
                data: {
                  // Basic bet info
                  gameName: bet.data.gameName || bet.data.game || 'Sportsbook',
                  amount: parseFloat(bet.data.amount || bet.data.betAmount || 0),
                  payout: parseFloat(bet.data.payout || bet.data.winAmount || 0),
                  provider: provider,
                  createdAt: bet.data.createdAt || bet.data.timestamp || bet.created_at || Date.now(),
                  
                  // Sports-specific data
                  status: bet.data.status || 'unknown',
                  payoutMultiplier: bet.data.payoutMultiplier || null,
                  
                  // Preserve outcomes for multi-selection bets
                  outcomes: bet.data.outcomes || [],
                  
                  // Save events data for tracking the bet's lifecycle
                  events: bet.data.events || []
                },
                created_at: bet.created_at || bet.timestamp || bet.data.createdAt || new Date().toISOString()
              };
            } else {
              // Regular slots bet - simplified data structure
              return {
                id: bet.id || bet._id || `bet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: betType,
                data: {
                  gameName: bet.data.gameName || bet.data.game || 'Unknown Game',
                  amount: parseFloat(bet.data.amount || bet.data.betAmount || 0),
                  payout: parseFloat(bet.data.payout || bet.data.winAmount || 0),
                  provider: standardizeProviderName(bet.data.provider || 'Unknown'),
                  createdAt: bet.data.createdAt || bet.data.timestamp || bet.created_at || Date.now()
                },
                created_at: bet.created_at || bet.timestamp || bet.data.createdAt || new Date().toISOString()
              };
            }
          } catch (err) {
            console.error('Error processing bet:', err);
            skippedEntries++;
            return null;
          }
        }).filter(bet => bet !== null); // Remove null entries
        
        // Add to existing bets - Prevent duplicates by checking IDs
        const existingIds = new Set(existingBets.map(bet => bet.id));
        const uniqueNewBets = uploadedBets.filter(bet => !existingIds.has(bet.id));
        
        // Count duplicates that were skipped
        duplicatesSkipped += uploadedBets.length - uniqueNewBets.length;
        
        existingBets = [...existingBets, ...uniqueNewBets];
        totalBetsAdded += uniqueNewBets.length;
        
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
    
    // Write the updated bets
    if (writeJsonFile(dataFiles.bets, existingBets)) {
      res.json({
        success: true,
        message: `Successfully added ${totalBetsAdded} bets from ${req.files.length - invalidFiles.length} files.`,
        skipped: skippedEntries,
        duplicatesSkipped: duplicatesSkipped,
        totalBets: existingBets.length,
        invalidFiles: invalidFiles.length > 0 ? invalidFiles : undefined,
        shouldRefresh: true // Signal to the frontend that it should refresh data
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


// GET bets list - Fixed to ensure it returns an array
app.get('/api/bets', (req, res) => {
  try {
    if (!fs.existsSync(dataFiles.bets)) {
      return res.json([]); // Return empty array
    }

    const rawData = fs.readFileSync(dataFiles.bets, 'utf8');

    // Safely try parsing
    let betsData;
    try {
      betsData = JSON.parse(rawData);
      // Ensure betsData is always an array
      if (!Array.isArray(betsData)) {
        betsData = [];
      }
    } catch (parseError) {
      console.error('Invalid JSON in bets.json:', parseError);
      return res.json([]); // Return empty array on parsing error
    }
    
    res.json(betsData);
  } catch (error) {
    console.error('Error reading bets.json:', error);
    res.json([]); // Return empty array on any error
  }
});

// GET transactions list
app.get('/api/transactions', (req, res) => {
  try {
    if (!fs.existsSync(dataFiles.transactions)) {
      return res.json([]);
    }

    const rawData = fs.readFileSync(dataFiles.transactions, 'utf8');

    // Safely try parsing
    let transactionsData;
    try {
      transactionsData = JSON.parse(rawData);
      // Ensure it's an array
      if (!Array.isArray(transactionsData)) {
        transactionsData = [];
      }
    } catch (parseError) {
      console.error('Invalid JSON in transactions.json:', parseError);
      return res.json([]);
    }
    res.json(transactionsData);
  } catch (error) {
    console.error('Error reading transactions.json:', error);
    res.json([]);
  }
});

// API test route
app.get('/api/upload', (req, res) => {
  res.json({
    message: 'File upload API is working',
    endpoints: {
      bets: '/api/upload/bets',
      transactions: '/api/upload/transactions'
    }
  });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// For any other routes, serve the index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});