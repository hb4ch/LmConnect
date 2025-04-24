const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveAPIKey: (provider, key) => {
    ipcRenderer.send('save-api-key', provider, key);
  },
  getAPIKey: (provider) => {
    return ipcRenderer.invoke('get-api-key', provider);
  },
  logChatMessage: (userMsg, botResp, provider) => {
    ipcRenderer.send('log-chat', userMsg, botResp, provider);
  },
  getChatHistory: () => {
    return ipcRenderer.invoke('get-chat-history');
  },
  getAPIBase: (provider) => {
    return ipcRenderer.invoke('get-api-base', provider);
  }
});
