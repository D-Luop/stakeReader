const express = require('express');
const router = express.Router();

// Dummy route
router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;
