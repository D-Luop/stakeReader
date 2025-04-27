// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.json()); // for parsing application/json

// Make sure 'uploads' folder exists
const uploadDir = path.join(__dirname, 'Bets.json');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Import your upload routes
const fileUploadRoutes = require('./routes/fileUpload');
app.use('/api/upload', fileUploadRoutes);

//GET bets list
app.get('/api/bets', (req, res) => {
  try {
    const betsPath = path.join(__dirname, 'api', 'Bets.json');

    if (!fs.existsSync(betsPath)) {
      return res.json([]);
    }

    const rawData = fs.readFileSync(betsPath, 'utf8');

    // Safely try parsing
    let betsData;
    try {
      betsData = JSON.parse(rawData);
    } catch (parseError) {
      console.error('Invalid JSON in Bets.json:', parseError);
      return res.status(500).json({ success: false, message: 'Invalid JSON format.' });
    }
    console.log(betsData)
    res.json(betsData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
