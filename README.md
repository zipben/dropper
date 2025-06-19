# MP3 Dropper

A secure web application for uploading MP3 files with automatic Plex metadata generation. Files are stored in individual folders along with their metadata for easy Plex integration.

## Features

- Drag-and-drop interface for MP3 file uploads
- Basic authentication protection
- Automatic metadata extraction from MP3 files
- Plex-compatible metadata file generation
- Individual folder creation for each track
- Modern, responsive UI
- Docker support for easy deployment

## Setup

### Option 1: Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   UPLOAD_PATH=/path/to/your/music/folder
   AUTH_USERNAME=your_username
   AUTH_PASSWORD=your_password
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Option 2: Docker Deployment

1. Clone this repository

2. Configure your environment variables:
   ```bash
   # Use default values
   docker compose up -d

   # Or create a .env file with custom values:
   PORT=3000
   AUTH_USERNAME=your_username
   AUTH_PASSWORD=your_password
   UPLOAD_PATH=/path/to/your/music/folder
   ```

3. Start the container:
   ```bash
   docker compose up -d
   ```

The application will be available at `http://localhost:3000` (or your configured port)

## Docker Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | The port number for the server | 3000 |
| AUTH_USERNAME | Username for basic authentication | admin |
| AUTH_PASSWORD | Password for basic authentication | changeme |
| UPLOAD_PATH | Local path to store uploaded files | ./uploads |

## Usage

1. Navigate to the web interface
2. Enter your configured username and password when prompted
3. Drag and drop MP3 files onto the upload zone (or click to select files)
4. Wait for the upload to complete
5. View the extracted metadata displayed on the page

## File Structure

For each uploaded MP3 file, the following structure is created:

```
UPLOAD_PATH/
└── song_name/
    ├── song.mp3
    └── metadata.json
```

The `metadata.json` file contains Plex-compatible metadata including:
- Title
- Artist
- Album
- Year
- Genre
- Duration
- Format

## Security

- Basic authentication protects the upload endpoint
- Only MP3 files are accepted
- Files are stored in separate directories to prevent conflicts
- Environment variables for sensitive configuration

## Requirements

### Local Development
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher

### Docker Deployment
- Docker 20.10.0 or higher
- Docker Compose V2 