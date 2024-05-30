const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const NodeClam = require('clamscan');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Initialize ClamAV
const initClamAV = async () => {
  try {
    const clamscan = await new NodeClam().init({
      remove_infected: true, // Removes files if they are infected
      quarantine_infected: false, // False: Don't move file to quarantine
      scan_log: '/var/log/node-clam.log', // Path to a writable log file to write scan results into
      debug_mode: true, // Whether or not to log info/debug/error msgs to the console
      file_list: null, // Path to file containing list of files to scan (for scan_files method)
      scan_recursively: true, // If true, deep scan folders recursively
      clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary on your server
        db: null, // Path to a custom virus definition database
        scan_archives: true, // If true, scan archives (e.g. .zip, .tar, .rar)
        active: true // If true, this module will consider using the clamscan binary
      },
      clamdscan: {
        path: '/usr/bin/clamdscan', // Path to clamdscan binary on your server
        config_file: '/etc/clamav/clamd.conf', // Path to the clamd config file
        multiscan: true, // If true, scan using all available cores for clamdscan
        reload_db: false, // If true, will re-load the DB on every call (slow)
        active: true // If true, this module will consider using the clamdscan binary
      },
      preference: 'clamdscan' // If clamdscan is found and active, it will be used by default
    });

    return clamscan;
  } catch (err) {
    console.error('Error initializing ClamAV:', err);
    throw err;
  }
};

initClamAV().then(clamscan => {
  // Handle image upload
  app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    try {
      const { is_infected, viruses } = await clamscan.is_infected(filePath);

      if (is_infected) {
        console.log('File is infected:', filePath, viruses);
        return res.status(400).send('File is infected.');
      }

      console.log('File is clean:', filePath);
      res.status(200).json({ message: 'File uploaded successfully.', filePath: `/uploads/${req.file.filename}` });
    } catch (err) {
      console.error('Error scanning file:', err);
      res.status(500).send('Error scanning file.');
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize ClamAV:', err);
  process.exit(1);
});
