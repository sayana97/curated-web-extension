
const mastodonBaseUrl = "https://mastodon.social"; // Replace with your instance
const token = "P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE"; // Replace with your actual token


document.addEventListener('DOMContentLoaded', () => {
  const postInput = document.getElementById('postInput');
  const postButton = document.getElementById('postButton');
  const fetchSelectionButton = document.getElementById('fetchSelectionButton');
  const selectedTextBox = document.getElementById('selectedTextBox');
  const selectedTextDisplay = document.getElementById('selectedText');

  let selectedText = null;

  // Fetch selected text from the active tab
  fetchSelectionButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    }, (results) => {
      const selection = results[0]?.result?.trim();
      if (selection) {
        selectedText = selection;
        selectedTextDisplay.textContent = `"${selectedText}"`;
        selectedTextBox.style.display = 'block';
        postInput.focus();
      } else {
        alert('No text selected. Please select some text on the page first.');
      }
    });
  });

  // Publish post to Mastodon
  postButton.addEventListener('click', async () => {
    const text = postInput.value.trim();
    if (!text && !selectedText) {
      alert('Please write a post or select some text first.');
      return;
    }

    const finalContent = selectedText
      ? `"${selectedText}"\n\n${text} #viaext`
      : `${text} #viaext`;

    const formData = new FormData();
    formData.append('status', finalContent);

    // Optional: handle copied image (if supported)
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('image/png')) {
          const blob = await item.getType('image/png');
          const imageForm = new FormData();
          imageForm.append('file', blob);

          const mediaUpload = await fetch('https://mastodon.social/api/v2/media', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageForm,
          });
          const mediaJson = await mediaUpload.json();
          if (mediaJson.id) {
            formData.append('media_ids[]', mediaJson.id);
          }
        }
      }
    } catch (err) {
      console.warn('Image from clipboard not supported or access denied:', err);
    }

    try {
      const response = await fetch('https://mastodon.social/api/v1/statuses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('✅ Post published!');
        postInput.value = '';
        selectedText = null;
        selectedTextBox.style.display = 'none';
      } else {
        const error = await response.json();
        alert('❌ Failed to publish: ' + (error?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      alert('❌ Failed to publish due to a network error.');
    }
  });
});
