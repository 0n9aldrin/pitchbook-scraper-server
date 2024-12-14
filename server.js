// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Load Google Sheets credentials
// const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
// const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Initialize Google Sheets API
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes,
});
const sheets = google.sheets({ version: 'v4', auth });

// Endpoint to append data to Google Sheets
app.post('/append-data', async (req, res) => {
  try {
    const { sheetName, data } = req.body;

    if (!sheetName || !data) {
      return res.status(400).json({ error: 'Missing sheetName or data in request body.' });
    }

    // Prepare the data in the format Sheets API expects
    const values = data.map(person => [
      person.title,
      person.firstName,
      person.lastName,
      person.email,
      person.position,
      person.company
    ]);

    const resource = {
      values,
    };

    const spreadsheetId = '1sKYaVN69jZ7yLovY-lvBZEgrcAZsrZ_s7lbi8m__NZY'; // Your Google Sheet ID

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      resource,
    });

    res.status(200).json({ message: 'Data appended successfully.', result: result.data });
  } catch (error) {
    console.error('Error appending data:', error);
    res.status(500).json({ error: 'Failed to append data to Google Sheets.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
