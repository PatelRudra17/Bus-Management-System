const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log(`Request from: ${req.ip}`);
  next();
});

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is reachable!' });
});

app.listen(5001, '0.0.0.0', () => {
  console.log('Test server on http://0.0.0.0:5001/test');
});
