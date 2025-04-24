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
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
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
    db.run('CREATE TABLE IF NOT EXISTS api_keys (provider TEXT PRIMARY KEY, api_key TEXT)');
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
    if (db) {
      db.close(() => {
        console.log('Database connection closed.');
      });
    }
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

// Save API key
ipcMain.on('save-api-key', (event, provider, key) => {
  db.run('INSERT OR REPLACE INTO api_keys (provider, api_key) VALUES (?, ?)', [provider, key]);
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
