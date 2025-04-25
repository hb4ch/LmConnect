const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveAPIKey: (provider, key, apiBase) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('save-api-key-error', (event, error) => {
        reject(new Error(error));
      });
      ipcRenderer.send('save-api-key', provider, key, apiBase);
      resolve();
    });
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
