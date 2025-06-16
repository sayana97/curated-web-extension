(function () {
  const existingSidebar = document.getElementById('mastodon-extension-sidebar');
  if (existingSidebar) return;

  // ========== Style for Highlights ==========
  const style = document.createElement('style');
  style.textContent = `
    mark.custom-highlight {
      background-color: yellow;
      color: black;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  // ========== Utils ==========
  function normalize(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  function getNormalizedUrl() {
    const url = new URL(window.location.href);
    // Remove trailing slash in pathname for normalization
    const pathname = url.pathname.replace(/\/$/, '');
    return `${url.origin}${pathname}`;
  }

  // ========== IndexedDB Helpers for Banner Persistence ==========
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('mastodonExtensionDB', 1);
      request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('banners')) {
          db.createObjectStore('banners', { keyPath: 'url' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
  }

  async function addBannerUrl(url) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('banners', 'readwrite');
        const store = tx.objectStore('banners');
        store.put({ url });
        tx.oncomplete = () => {
          console.log('[Banner] URL saved:', url);
          resolve();
        };
        tx.onerror = e => {
          console.error('[Banner] Error saving URL:', e);
          reject(tx.error);
        };
        tx.onabort = e => {
          console.error('[Banner] Transaction aborted:', e);
          reject(tx.error);
        };
      });
    } catch (err) {
      console.error('[Banner] IndexedDB error:', err);
    }
  }

  async function hasBannerUrl(url) {
    try {
      const db = await openDB();
      const tx = db.transaction('banners', 'readonly');
      const store = tx.objectStore('banners');
      return new Promise((resolve) => {
        const request = store.get(url);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
      });
    } catch (err) {
      console.error('[Banner] IndexedDB error:', err);
      return false;
    }
  }

  // ========== Highlight Logic ==========
  function highlightAllMatches(container, text) {
    if (!text) return;
    const normalizedText = normalize(text);
    if (!normalizedText) return;

    const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const re = new RegExp(normalizedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      if (node.parentNode && node.parentNode.tagName === 'MARK') continue;

      if (re.test(node.textContent)) {
        const parent = node.parentNode;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;

        node.textContent.replace(re, (match, index) => {
          const before = node.textContent.slice(lastIndex, index);
          const mark = document.createElement('mark');
          mark.className = 'custom-highlight';
          mark.textContent = match;

          if (before) frag.appendChild(document.createTextNode(before));
          frag.appendChild(mark);
          lastIndex = index + match.length;
        });

        const after = node.textContent.slice(lastIndex);
        if (after) frag.appendChild(document.createTextNode(after));

        parent.replaceChild(frag, node);
      }
    }
  }

  function saveAndHighlightSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = normalize(selection.toString());
    if (!selectedText) return;

    chrome.storage.sync.get('highlightedItems', (result) => {
      let highlights = result.highlightedItems || [];
      highlights.push({ text: selectedText, url: getNormalizedUrl() });
      chrome.storage.sync.set({ highlightedItems: highlights }, () => {
        console.log('[Highlight] Saved selection:', selectedText);
      });
    });

    const mark = document.createElement('mark');
    mark.className = 'custom-highlight';

    try {
      range.surroundContents(mark);
    } catch (e) {
      const selectedString = selection.toString();
      range.deleteContents();
      mark.textContent = selectedString;
      range.insertNode(mark);
    }

    selection.removeAllRanges();
  }

  // ========== Sidebar UI ==========
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

  toggleBtn.onclick = () => {
    sidebarOpen = !sidebarOpen;
    sidebar.style.right = sidebarOpen ? '0' : '-400px';
    document.body.style.marginRight = sidebarOpen ? '400px' : '0';
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_SELECTION') {
      sendResponse({ selection: window.getSelection().toString() });
    } else if (request.type === 'HIGHLIGHT_SELECTION') {
      saveAndHighlightSelection();
    }
    return true;
  });

  // ========== Message Handling from Sidebar ==========
  window.addEventListener('message', async event => {
    if (!event.data || event.data.source !== 'mastodon-sidebar') return;

    const { action } = event.data;
    switch (action) {
      case 'hideHeaders':
        document.querySelectorAll('header, h1, h2').forEach(el => el.style.display = 'none');
        break;

      case 'increaseFont':
        fontSizeLevel++;
        document.body.style.fontSize = `${100 + fontSizeLevel * 10}%`;
        break;

      case 'hideImages':
        document.querySelectorAll('img').forEach(img => img.style.display = 'none');
        break;

      case 'highlightSelection':
        saveAndHighlightSelection();
        break;

      case 'addBanner':
        addBannerToPage();
        const normUrl = getNormalizedUrl();
        await addBannerUrl(normUrl);
        break;

      default:
        console.warn('Unknown action from sidebar:', action);
    }
  });

  // ========== Banner ==========
  function addBannerToPage() {
    if (document.getElementById('mastodon-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'mastodon-banner';
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
    console.log('[Banner] Added to page');
  }

  // ========== Observe Banner Removal ==========
  function observeBannerRemoval() {
    const observer = new MutationObserver(() => {
      if (!document.getElementById('mastodon-banner')) {
        const normUrl = getNormalizedUrl();
        hasBannerUrl(normUrl).then(hasBanner => {
          if (hasBanner) {
            console.log('[Banner] Banner removed, re-adding...');
            addBannerToPage();
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ========== Restore Highlights + Banner ==========
  async function restorePageModifications() {
    const normUrl = getNormalizedUrl();
    console.log('[Restore] Checking banner for URL:', normUrl);
    if (await hasBannerUrl(normUrl)) {
      addBannerToPage();
    } else {
      console.log('[Restore] No banner for this URL');
    }

    chrome.storage.sync.get('highlightedItems', (result) => {
      const savedHighlights = result.highlightedItems || [];
      savedHighlights.forEach(({ text, url }) => {
        if (url === normUrl) {
          console.log('[Restore] Restoring highlight:', text);
          highlightAllMatches(document.body, text);
        }
      });
    });
  }

  // ========== SPA URL Change Detection ==========
  let lastUrl = location.href;
  function detectUrlChange() {
    if (location.href !== lastUrl) {
      console.log('[SPA] URL changed:', location.href);
      lastUrl = location.href;
      restorePageModifications();
    }
  }
  new MutationObserver(detectUrlChange).observe(document, { subtree: true, childList: true });

  // ========== Initialize ==========
  window.addEventListener('DOMContentLoaded', async () => {
  // Delay a bit to let page settle
  setTimeout(async () => {
    // Manually add banner URL for the Wikipedia page once per session
    const manualUrl = 'https://en.wikipedia.org/wiki/Pseudastacus';
    const normUrl = getNormalizedUrl();

    // If current normalized URL matches manual URL (normalize both)
    if (normUrl === manualUrl.replace(/\/$/, '')) {
      console.log('[Manual] Adding banner URL manually for:', manualUrl);
      await addBannerUrl(manualUrl);  // Save to IndexedDB
    }

    restorePageModifications();
    observeBannerRemoval();
  }, 800);
});

})();
