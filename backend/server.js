const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sumaiyakn28_db_user:77qsj5Rz5kUfkEGl@cluster0.lygu39u.mongodb.net/fee-form?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// Define Download Schema and Model
const downloadSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Download = mongoose.model('Download', downloadSchema);

// API endpoint to log a download
app.post('/api/log-download', async (req, res) => {
    const { regNo } = req.body;
    
    if (!regNo) {
        return res.status(400).json({ error: 'regNo is required' });
    }

    try {
        const newDownload = new Download({ regNo });
        const savedDownload = await newDownload.save();
        res.status(201).json({ message: 'Download logged successfully', id: savedDownload._id });
    } catch (err) {
        console.error('Error inserting into database:', err.message);
        res.status(500).json({ error: 'Failed to log download' });
    }
});

// API endpoint to retrieve all logs (for admin purposes)
app.get('/api/downloads', async (req, res) => {
    try {
        const downloads = await Download.find().sort({ timestamp: -1 });
        res.json({
            total_downloads: downloads.length,
            data: downloads
        });
    } catch (err) {
        console.error('Error fetching logs:', err.message);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
