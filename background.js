chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ enabled: true }); // Enable by default
});
