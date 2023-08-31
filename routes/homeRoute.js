// routes/homeRoute.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/subscribe'); 
});

module.exports = {
  router,
};
