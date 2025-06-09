(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);

  const domain = url.hostname;
  const fullPath = url.pathname.replace(/\/$/, ''); // remove trailing slash if any
  const fullUrlSearchTerm = `${domain}${fullPath}`; // e.g. example.com/page1

  const postTemplate = document.getElementById('postTemplate');
  const accessToken = 'P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE';

  let selectedText = '';
  const selectedTextBox = document.getElementById('selectedTextBox');
  const selectedTextDisplay = document.getElementById('selectedText');
  const postInput = document.getElementById('postInput');
  const postButton = document.getElementById('postButton');
  const commentHistory = document.getElementById('commentHistory');
  const USERNAME = 'You'; // need to replace with dynamic username if available

  // Load stored comments from localStorage and display them
  function loadComments() {
    const comments = JSON.parse(localStorage.getItem('pageComments') || '[]');
    // Clear old comments (except the header)
    commentHistory.querySelectorAll('.comment-entry').forEach(el => el.remove());

    comments.forEach(comment => {
      const div = document.createElement('div');
      div.className = 'comment-entry';
      div.style.marginBottom = '10px';
      div.innerHTML = `
      <strong>${comment.user}</strong> commented on "<em>${comment.selection}</em>":<br>
      💬 ${comment.text}
      <hr>
    `;
      commentHistory.appendChild(div);
    });
  }

  // Publish a new comment
  postButton.addEventListener('click', () => {
    const commentText = postInput.value.trim();
    if (!selectedText || !commentText) {
      alert('Please select text and write a comment.');
      return;
    }

    const comment = {
      user: USERNAME,
      selection: selectedText,
      text: commentText,
      timestamp: Date.now()
    };

    const comments = JSON.parse(localStorage.getItem('pageComments') || '[]');
    comments.push(comment);
    localStorage.setItem('pageComments', JSON.stringify(comments));

    // Clear UI
    postInput.value = '';
    selectedText = '';
    selectedTextBox.style.display = 'none';
    selectedTextDisplay.textContent = '';

    // Reload comment history
    loadComments();
  });

  // Fetch selected text from content script
  document.getElementById('fetchSelectionButton').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, response => {
      if (chrome.runtime.lastError) {
        alert('Could not fetch selection.');
        console.error(chrome.runtime.lastError.message);
        return;
      }

      if (response && response.selection) {
        selectedText = response.selection.trim();
        if (selectedText) {
          selectedTextBox.style.display = 'block';
          selectedTextDisplay.textContent = selectedText;
        }
      } else {
        alert('No text selected.');
      }
    });
  });

  // Load comments on sidebar load
  loadComments();

  document.getElementById('postButton').addEventListener('click', async () => {
    const postInput = document.getElementById('postInput').value.trim();
    if (!postInput) return alert('Please write something.');

    const fullContent = selectedText
      ? `🔍 *Commenting on:*\n"${selectedText}"\n\n💬 ${postInput}\n\n(${domain}) #viaExtension`
      : `${postInput}\n\n(${domain}) #viaExtension`;

    try {
      const res = await fetch('https://mastodon.social/api/v1/statuses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: fullContent })
      });

      if (res.ok) {
        alert('Post published!');
        window.location.reload();
      } else {
        alert('Failed to publish post.');
        console.error(await res.text());
      }
    } catch (e) {
      alert('Error publishing post.');
      console.error(e);
    }
  });

  //  future work - moved to sidebar_actions.js fornow

  // document.addEventListener('DOMContentLoaded', () => {
  //   const highlightBtn = document.getElementById('highlightBtn');
  //   const hideImagesBtn = document.getElementById('hideImagesBtn');
  //   const addBannerBtn = document.getElementById('addBannerBtn');
  //   const increaseFontBtn = document.getElementById('increaseFontBtn');

  //   const toggleHeader = document.getElementById('toggleHeader');
  //   const actionsBody = document.getElementById('actionsBody');
  //   const toggleIcon = document.getElementById('toggle-icon');

  //   // Set default state in localStorage if not set (closed by default)
  //   if (localStorage.getItem('actionsVisible') === null) {
  //     localStorage.setItem('actionsVisible', 'false');
  //   }

  //   // Get current state from localStorage
  //   const visible = localStorage.getItem('actionsVisible') === 'true';

  //   if (actionsBody && toggleIcon) {
  //     actionsBody.style.display = visible ? 'block' : 'none';
  //     toggleIcon.textContent = visible ? '▼' : '►';
  //   }

  //   // Setup toggle button listener
  //   if (toggleHeader && actionsBody && toggleIcon) {
  //     toggleHeader.addEventListener('click', () => {
  //       const isVisible = actionsBody.style.display !== 'none';
  //       actionsBody.style.display = isVisible ? 'none' : 'block';
  //       toggleIcon.textContent = isVisible ? '►' : '▼';
  //       localStorage.setItem('actionsVisible', !isVisible); // Save new state
  //     });
  //   }

  //   if (highlightBtn) {
  //     highlightBtn.addEventListener('click', () => {
  //       window.parent.postMessage({ source: 'mastodon-sidebar', action: 'highlightSelection' }, '*');
  //     });
  //   }

  //   if (hideImagesBtn) {
  //     hideImagesBtn.addEventListener('click', () => {
  //       window.parent.postMessage({ source: 'mastodon-sidebar', action: 'hideImages' }, '*');
  //     });
  //   }

  //   if (addBannerBtn) {
  //     addBannerBtn.addEventListener('click', () => {
  //       window.parent.postMessage({ source: 'mastodon-sidebar', action: 'addBanner' }, '*');
  //     });
  //   }

  //   if (increaseFontBtn) {
  //     increaseFontBtn.addEventListener('click', () => {
  //       window.parent.postMessage({ source: 'mastodon-sidebar', action: 'increaseFont' }, '*');
  //     });
  //   }

  //   // Filter functionality
  //   const postFilter = document.getElementById('postFilter');
  //   postFilter.addEventListener('change', () => {
  //     const selectedValue = postFilter.value;
  //     const sections = {
  //       following: document.getElementById('section-following'),
  //       favorites: document.getElementById('section-favorites'),
  //       trending: document.getElementById('section-trending'),
  //       extension: document.getElementById('section-extension'),
  //       others: document.getElementById('section-others')
  //     };

  //     for (const key in sections) {
  //       if (sections[key]) {
  //         if (selectedValue === 'all' || selectedValue === key) {
  //           sections[key].parentElement.style.display = 'block';
  //         } else {
  //           sections[key].parentElement.style.display = 'none';
  //         }
  //       }
  //     }
  //   });
  // });

  try {
    // Get user info
    const userRes = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = await userRes.json();

    // Your own posts
    const myPostsRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/statuses`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const myPosts = await myPostsRes.json();
    const extensionPosts = myPosts.filter(post =>
      post.content.includes(domain) && post.content.includes('#viaExtension')
    );

    // Who you're following
    const followingRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/following`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const followingList = await followingRes.json();
    const followingIds = followingList.map(account => account.id);

    // Prepare hashtags (URL-safe)
    const generateHashtag = str =>
      '#' + str.replace(/^\/+/, '').replace(/[^\w]/g, '_').replace(/_+/g, '_').toLowerCase();

    const hashtagFromPath = generateHashtag(`${domain}${fullPath}`);
    const hashtagFromDomain = generateHashtag(domain);

    let posts = [];

    // 1. Try full path (most specific)
    try {
      const res1 = await fetch(`https://mastodon.social/api/v2/search?q=${encodeURIComponent(fullUrlSearchTerm)}&resolve=true`);
      const data1 = await res1.json();
      if (data1.statuses?.length > 0) posts = data1.statuses;
    } catch (e) {
      console.error('Path-level search failed:', e);
    }

    // 2. Try hashtag search if path-based failed
    if (posts.length === 0) {
      try {
        const hashtagRes1 = await fetch(`https://mastodon.social/api/v2/search?q=${encodeURIComponent(hashtagFromPath)}&resolve=true`);
        const hashtagData1 = await hashtagRes1.json();
        if (hashtagData1.statuses?.length > 0) posts = hashtagData1.statuses;
      } catch (e) {
        console.error('Hashtag (path) search failed:', e);
      }
    }

    // 3. Try domain hashtag if others failed
    if (posts.length === 0) {
      try {
        const hashtagRes2 = await fetch(`https://mastodon.social/api/v2/search?q=${encodeURIComponent(hashtagFromDomain)}&resolve=true`);
        const hashtagData2 = await hashtagRes2.json();
        if (hashtagData2.statuses?.length > 0) posts = hashtagData2.statuses;
      } catch (e) {
        console.error('Hashtag (domain) search failed:', e);
      }
    }

    // 4. Fallback to domain-level search
    if (posts.length === 0) {
      try {
        const res2 = await fetch(`https://mastodon.social/api/v2/search?q=${encodeURIComponent(domain)}&resolve=true`);
        const data2 = await res2.json();
        posts = data2.statuses || [];
      } catch (e) {
        console.error('Domain-level search failed:', e);
      }
    }


    // Sort posts
    const sortByRank = list => {
      return list.sort((a, b) => {
        const favDiff = b.favourites_count - a.favourites_count;
        if (favDiff !== 0) return favDiff;
        const linkA = a.content.includes('<a ');
        const linkB = b.content.includes('<a ');
        return linkB - linkA; // Put posts with links higher
      });
    };

    const followedPosts = sortByRank(posts.filter(post => followingIds.includes(post.account.id)));
    const otherPosts = sortByRank(posts.filter(post => !followingIds.includes(post.account.id)));

    const renderPosts = (postList, sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      postList.forEach(post => {
        const clone = postTemplate.content.cloneNode(true);
        const textElem = clone.querySelector('.post-text');
        const mediaContainer = clone.querySelector('.media-container');
        const metaElem = clone.querySelector('.post-meta');
        const postElem = clone.querySelector('.post');

        textElem.innerHTML = post.content;

        metaElem.textContent = `By ${post.account.display_name || post.account.username} on ${new Date(post.created_at).toLocaleString()}`;

        //  Favourites and boosts count
        // const metaFav = document.createElement('small');
        // metaFav.textContent = `❤️ ${post.favourites_count}   🔁 ${post.reblogs_count}`;
        // clone.appendChild(metaFav);

        // Follow button if not following
        if (post.account.id !== user.id && !followingIds.includes(post.account.id)) {
          const followBtn = document.createElement('button');
          followBtn.textContent = 'Follow';
          followBtn.className = 'follow-btn';
          followBtn.addEventListener('click', async () => {
            try {
              const followRes = await fetch(`https://mastodon.social/api/v1/accounts/${post.account.id}/follow`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (followRes.ok) {
                alert(`Now following ${post.account.display_name || post.account.username}`);
                followBtn.disabled = true;
                followBtn.textContent = '✔️ Following';
              } else {
                alert('Failed to follow.');
                console.error(await followRes.text());
              }
            } catch (err) {
              alert('Error following user.');
              console.error(err);
            }
          });
          clone.querySelector('.post-actions').appendChild(followBtn);
        }

        // Render images
        if (post.media_attachments?.length > 0) {
          post.media_attachments.forEach(media => {
            if (media.type === 'image') {
              const img = document.createElement('img');
              img.src = media.preview_url || media.url;
              img.alt = media.description || 'Attached image';
              img.className = 'post-image';
              mediaContainer.appendChild(img);
            }
          });
        }

        section.appendChild(clone);
      });
    };

    if (extensionPosts.length > 0) {
      renderPosts(extensionPosts, 'section-extension');
    }

    if (followedPosts.length > 0) renderPosts(followedPosts, 'section-following');
    if (otherPosts.length > 0) renderPosts(otherPosts, 'section-others');

    // Favorites and Trending sections are currently not implemented
    // renderPosts(favoritePosts, 'section-favorites');
    // renderPosts(trendingPosts, 'section-trending');

  } catch (err) {
    const feedDiv = document.getElementById('feed');
    feedDiv.innerHTML = `<p>Error loading posts.</p>`;
    console.error(err);
  }
})();
