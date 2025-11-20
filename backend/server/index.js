require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require("reflect-metadata");

const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');
const redirectRoutes = require('./routes/redirect');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// APIs
app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);

// redirect (short url): e.g. GET /r/:shortId
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
