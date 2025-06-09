(function () {
  const existingSidebar = document.getElementById('mastodon-extension-sidebar');
  if (existingSidebar) return;

  const sidebar = document.createElement('iframe');
  sidebar.id = 'mastodon-extension-sidebar';
  sidebar.src = chrome.runtime.getURL('sidebar.html');
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100%;
    z-index: 999999;
    border: none;
    box-shadow: -2px 0 8px rgba(0,0,0,0.3);
    transition: right 0.3s ease;
  `;
  document.body.appendChild(sidebar);

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'mastodon-toggle-btn';
  toggleBtn.textContent = '🦣';
  toggleBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 10px;
    z-index: 1000000;
    background-color: #0077cc;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
    font-size: 18px;
  `;
  document.body.appendChild(toggleBtn);

  let sidebarOpen = false;
  let fontSizeLevel = 0;
  // let darkModeEnabled = false; // Uncomment to use dark mode toggle

  toggleBtn.onclick = () => {
    sidebarOpen = !sidebarOpen;
    sidebar.style.right = sidebarOpen ? '0' : '-400px';
    document.body.style.marginRight = sidebarOpen ? '400px' : '0';
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_SELECTION') {
      const selectedText = window.getSelection().toString();
      sendResponse({ selection: selectedText });
    }
    return true;
  });

  window.addEventListener('message', event => {
    if (!event.data || event.data.source !== 'mastodon-sidebar') return;

    const { action } = event.data;
    switch (action) {
      case 'hideHeaders':
        document.querySelectorAll('header, h1, h2').forEach(el => el.style.display = 'none');
        break;

      // Uncomment to use dark mode toggle
      /*
      case 'toggleDarkMode':
        darkModeEnabled = !darkModeEnabled;
        if (darkModeEnabled) {
          document.body.style.backgroundColor = '#121212';
          document.body.style.color = '#e0e0e0';
        } else {
          document.body.style.backgroundColor = '';
          document.body.style.color = '';
        }
        break;
      */

      case 'increaseFont':
        fontSizeLevel++;
        const newSize = 100 + fontSizeLevel * 10;
        document.body.style.fontSize = newSize + '%';
        break;

      case 'hideImages':
        document.querySelectorAll('img').forEach(img => img.style.display = 'none');
        break;

      case 'highlightSelection':
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = selection.toString();

          // Save the highlighted text and offset
          const highlightData = {
            text: selectedText,
            timestamp: Date.now()
          };

          // Save to localStorage (can also use chrome.storage)
          let highlights = JSON.parse(localStorage.getItem('highlights') || '[]');
          highlights.push(highlightData);
          localStorage.setItem('highlights', JSON.stringify(highlights));

          // Apply highlight visually
          const span = document.createElement('span');
          span.style.backgroundColor = 'yellow';
          span.textContent = selectedText;
          range.deleteContents();
          range.insertNode(span);
        }
        break;


      case 'addBanner':
        const banner = document.createElement('div');
        banner.textContent = '🚀 This page was modified by your extension!';
        banner.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 10px;
          background: #ff9800;
          color: white;
          font-weight: bold;
          text-align: center;
          z-index: 99999;
        `;
        document.body.prepend(banner);
        break;

      default:
        console.warn('Unknown action from sidebar:', action);
    }
  });
})();
