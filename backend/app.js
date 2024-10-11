const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());  // req & res sent to cookies
app.use(express.json());

dotenv.config({ path: path.join(__dirname, "config/config.env") });

const authRoute = require('./routes/auth');
app.use('/api/v1', authRoute);

//build config
if (process.env.NODE_ENV === "production") {
    // frontend build access 
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // index.html have main.js like 
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
    });
}

module.exports = app;
