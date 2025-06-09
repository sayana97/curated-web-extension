document.addEventListener('DOMContentLoaded', () => {
  const highlightBtn = document.getElementById('highlightBtn');
  const hideImagesBtn = document.getElementById('hideImagesBtn');
  const addBannerBtn = document.getElementById('addBannerBtn');
  const increaseFontBtn = document.getElementById('increaseFontBtn');

  const toggleHeader = document.getElementById('toggleHeader');
  const actionsBody = document.getElementById('actionsBody');
  const toggleIcon = document.getElementById('toggle-icon');

  // Set default state in localStorage if not set
  if (localStorage.getItem('actionsVisible') === null) {
    localStorage.setItem('actionsVisible', 'false');
  }

  const visible = localStorage.getItem('actionsVisible') === 'true';
  if (actionsBody && toggleIcon) {
    actionsBody.style.display = visible ? 'block' : 'none';
    toggleIcon.textContent = visible ? '▼' : '►';
  }

  if (toggleHeader && actionsBody && toggleIcon) {
    toggleHeader.addEventListener('click', () => {
      const isVisible = actionsBody.style.display !== 'none';
      actionsBody.style.display = isVisible ? 'none' : 'block';
      toggleIcon.textContent = isVisible ? '►' : '▼';
      localStorage.setItem('actionsVisible', !isVisible);
    });
  }

  if (highlightBtn) {
    highlightBtn.addEventListener('click', () => {
      window.parent.postMessage({ source: 'mastodon-sidebar', action: 'highlightSelection' }, '*');
    });
  }

  if (hideImagesBtn) {
    hideImagesBtn.addEventListener('click', () => {
      window.parent.postMessage({ source: 'mastodon-sidebar', action: 'hideImages' }, '*');
    });
  }

  if (addBannerBtn) {
    addBannerBtn.addEventListener('click', () => {
      window.parent.postMessage({ source: 'mastodon-sidebar', action: 'addBanner' }, '*');
    });
  }

  if (increaseFontBtn) {
    increaseFontBtn.addEventListener('click', () => {
      window.parent.postMessage({ source: 'mastodon-sidebar', action: 'increaseFont' }, '*');
    });
  }

  const postFilter = document.getElementById('postFilter');
  if (postFilter) {
    postFilter.addEventListener('change', () => {
      const selectedValue = postFilter.value;
      const sections = {
        following: document.getElementById('section-following'),
        favorites: document.getElementById('section-favorites'),
        trending: document.getElementById('section-trending'),
        extension: document.getElementById('section-extension'),
        others: document.getElementById('section-others')
      };

      for (const key in sections) {
        if (sections[key]) {
          sections[key].parentElement.style.display = (selectedValue === 'all' || selectedValue === key) ? 'block' : 'none';
        }
      }
    });
  }
});
