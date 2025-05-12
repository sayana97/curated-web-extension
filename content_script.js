(function () {
  const existingSidebar = document.getElementById('mastodon-extension-sidebar');
  if (existingSidebar) return; // Prevent duplicates

  // Create sidebar
  const sidebar = document.createElement('iframe');
  sidebar.id = 'mastodon-extension-sidebar';
  sidebar.src = chrome.runtime.getURL('sidebar.html');
  document.body.appendChild(sidebar);

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'mastodon-toggle-btn';
  toggleBtn.textContent = '🦣';
  document.body.appendChild(toggleBtn);

  let sidebarOpen = false;

  toggleBtn.onclick = () => {
    sidebarOpen = !sidebarOpen;
    sidebar.style.right = sidebarOpen ? '0' : '-400px';
    document.body.style.marginRight = sidebarOpen ? '400px' : '0';
  };
})();
