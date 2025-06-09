chrome.action.onClicked.addListener(async (tab) => {
  try {
    const url = tab.url;

    // Skip unsupported schemes like chrome://, about:, file:// etc.
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("file://")
    ) {
      console.warn("This extension cannot run on this type of page:", url);
      return;
    }

    // Inject content.js into the current active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (error) {
    console.error("Failed to inject content script:", error);
  }
});
