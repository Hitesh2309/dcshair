const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
