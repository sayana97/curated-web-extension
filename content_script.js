(function () {
  const existingSidebar = document.getElementById('mastodon-extension-sidebar');
  if (existingSidebar) return; // Prevent duplicates

  // Create sidebar
  const sidebar = document.createElement('iframe');
  sidebar.id = 'mastodon-extension-sidebar';
  sidebar.src = chrome.runtime.getURL('sidebar.html');
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100%;
    z-index: 9999;
    border: none;
    transition: right 0.3s ease;
  `;
  document.body.appendChild(sidebar);

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'mastodon-toggle-btn';
  toggleBtn.textContent = '🦣';
  toggleBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    font-size: 24px;
    padding: 5px 10px;
    border-radius: 4px;
    background-color: #333;
    color: white;
    border: none;
    cursor: pointer;
  `;
  document.body.appendChild(toggleBtn);

  let sidebarOpen = false;

  toggleBtn.onclick = () => {
    sidebarOpen = !sidebarOpen;
    sidebar.style.right = sidebarOpen ? '0' : '-400px';
    document.body.style.marginRight = sidebarOpen ? '400px' : '0';
  };

  // Listen for messages from sidebar to manipulate the page
  window.addEventListener('message', event => {
    if (!event.data || event.data.source !== 'mastodon-sidebar') return;

    const { action } = event.data;
    switch (action) {
      case 'hideHeaders':
        document.querySelectorAll('header, h1, h2').forEach(el => el.style.display = 'none');
        break;

      case 'darkMode':
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#e0e0e0';
        break;

      case 'increaseFont':
        document.body.style.fontSize = 'larger';
        break;

      case 'hideImages':
        document.querySelectorAll('img').forEach(img => img.style.display = 'none');
        break;

      case 'highlightSelection':
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.style.backgroundColor = 'yellow';
          span.textContent = selection.toString();
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
