chrome.action.onClicked.addListener(async (tab) => {
  try {
    const url = tab.url;

    // Skip chrome://, chrome-extension://, etc.
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
      console.warn("Cannot run on this type of page:", url);
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (error) {
    console.error("Script injection failed:", error);
  }
});
