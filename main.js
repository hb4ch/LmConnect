const { app, BrowserWindow } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(app.getPath('userData'), 'lmconnect.db');
let db;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Set CSP headers to allow API requests
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.deepseek.com",
          "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.deepseek.com"
        ]
      }
    });
  });

  mainWindow.loadFile('index.html');
}

function initDatabase() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database error:', err.message);
      return;
    }
    console.log('Connected to the database.');

    // Create tables if they don't exist
    db.run('CREATE TABLE IF NOT EXISTS api_keys (provider TEXT PRIMARY KEY, api_key TEXT, api_base TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_message TEXT, bot_response TEXT, provider TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');
  });
}

app.on('ready', () => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // Close database connection on all platforms
  if (db) {
    db.close(() => {
      console.log('Database connection closed.');
    });
  }
});

// IPC main handlers
const { ipcMain } = require('electron');

// Get API key
ipcMain.handle('get-api-key', (event, provider) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT api_key FROM api_keys WHERE provider = ?', [provider], (err, row) => {
      if (err) return reject(err);
      resolve(row?.api_key || null);
    });
  });
});

// Save API key and base URL
ipcMain.on('save-api-key', (event, provider, key, apiBase) => {
  db.run('INSERT OR REPLACE INTO api_keys (provider, api_key, api_base) VALUES (?, ?, ?)', 
    [provider, key, apiBase || null], (err) => {
      if (err) {
        console.error('Failed to save API key:', err);
        event.sender.send('save-api-key-error', err.message);
      }
    });
});

// Get API base URL
ipcMain.handle('get-api-base', (event, provider) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT api_base FROM api_keys WHERE provider = ?', [provider], (err, row) => {
      if (err) return reject(err);
      resolve(row?.api_base || null);
    });
  });
});

// Log chat message
ipcMain.handle('log-chat', (event, userMsg, botResp, provider) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO chat_history (user_message, bot_response, provider) VALUES (?, ?, ?)', [userMsg, botResp, provider], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
});

// Get chat history
ipcMain.handle('get-chat-history', (event) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM chat_history ORDER BY timestamp DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
});
