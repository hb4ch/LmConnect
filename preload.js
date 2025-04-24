const contextBridge = require('electron').contextBridge;
const { ipcRenderer, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveAPIKey: (provider, key) => ipcRenderer.send('save-api-key', provider, key),
  getAPIKey: (provider) => ipcRenderer.invoke('get-api-key', provider),
  logChatMessage: (userMsg, botResp, provider) => ipcRenderer.send('log-chat', userMsg, botResp, provider),
  getChatHistory: () => ipcRenderer.invoke('get-chat-history')
});
