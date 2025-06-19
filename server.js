require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

const app = express();
const port = process.env.PORT || 3000;

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Parse JSON bodies
app.use(express.json());

// Basic authentication middleware
const auth = basicAuth({
    users: { [process.env.AUTH_USERNAME || 'admin']: process.env.AUTH_PASSWORD || 'changeme' },
    challenge: true,
    unauthorizedResponse: (req) => {
        console.log('Auth failed:', req.auth);
        return 'Unauthorized';
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const fileName = path.parse(file.originalname).name;
        const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', fileName);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
            cb(null, true);
        } else {
            cb(new Error('Only MP3 files are allowed'));
        }
    }
});

// Serve static files EXCEPT upload.html
app.use(express.static('public', {
    index: 'index.html'
}));

// Debug middleware for protected routes
app.use('/upload.html', (req, res, next) => {
    console.log('Accessing upload.html');
    console.log('Headers:', req.headers);
    next();
});

// Protect upload.html with authentication
app.get('/upload.html', auth, (req, res) => {
    console.log('Authentication successful for upload.html');
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Login endpoint
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const validUsername = process.env.AUTH_USERNAME || 'admin';
    const validPassword = process.env.AUTH_PASSWORD || 'changeme';

    if (username === validUsername && password === validPassword) {
        console.log('Login successful for user:', username);
        res.json({ success: true });
    } else {
        console.log('Login failed for user:', username);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Check authentication endpoint
app.get('/check-auth', auth, (req, res) => {
    console.log('Auth check successful');
    res.json({ authenticated: true });
});

// Protected upload endpoint
app.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const metadata = await mm.parseFile(filePath);
        
        // Create Plex-compatible metadata file
        const metadataPath = path.join(path.dirname(filePath), 'metadata.json');
        const plexMetadata = {
            title: metadata.common.title || path.parse(req.file.originalname).name,
            artist: metadata.common.artist || 'Unknown Artist',
            album: metadata.common.album || 'Unknown Album',
            year: metadata.common.year || '',
            genre: metadata.common.genre || [],
            duration: metadata.format.duration || 0,
            format: metadata.format.container || 'MP3'
        };

        fs.writeFileSync(metadataPath, JSON.stringify(plexMetadata, null, 2));

        res.json({
            message: 'File uploaded successfully',
            metadata: plexMetadata
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 