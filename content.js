(function () {
  const existingSidebar = document.getElementById('mastodon-extension-sidebar');
  if (existingSidebar) return; // Prevent duplicates

  // Create sidebar iframe
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

  // Create toggle button
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

  toggleBtn.onclick = () => {
    sidebarOpen = !sidebarOpen;
    sidebar.style.right = sidebarOpen ? '0' : '-400px';
    document.body.style.marginRight = sidebarOpen ? '400px' : '0';
  };
})();
