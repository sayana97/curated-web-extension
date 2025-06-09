const MASTODON_BASE_URL = "https://mastodon.social";
const ACCESS_TOKEN = 'P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE';

// UI Elements
const postsFromFollowedContainer = document.getElementById("postsFromFollowed");
const favoritedPostsContainer = document.getElementById("favoritedPosts");
const extensionPostsContainer = document.getElementById("extensionPosts");
const otherPostsContainer = document.getElementById("otherPosts");

const newPostContent = document.getElementById("newPostContent");
const mediaInput = document.getElementById("mediaInput");
const errorMessage = document.getElementById("errorMessage");
const loadingIndicator = document.getElementById("loadingIndicator");
const notificationBanner = document.getElementById("notificationBanner");

let isLoading = false;
let favoritedPostIds = new Set();
let extensionPostIds = new Set(); // IDs of posts created via extension (stored locally)
let lastFetchedPostId = null;

// Helpers

function setLoading(loading) {
  isLoading = loading;
  loadingIndicator.style.display = loading ? "block" : "none";
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = msg ? "block" : "none";
}

function clearError() {
  showError("");
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString();
}

function sanitizeHTML(html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    throw e;
  }
}

// Renderers

function renderAttachments(attachments) {
  if (!attachments || attachments.length === 0) return "";
  let html = '<div class="attachments">';
  for (const att of attachments) {
    if (att.type === "image") {
      html += `<img src="${att.url}" alt="image" class="post-image"/>`;
    } else if (att.type === "video") {
      html += `<video controls class="post-video"><source src="${att.url}" type="${att.mime_type}"></video>`;
    } else if (att.type === "audio") {
      html += `<audio controls class="post-audio"><source src="${att.url}" type="${att.mime_type}"></audio>`;
    }
  }
  html += "</div>";
  return html;
}

function renderPoll(poll) {
  if (!poll) return "";

  let html = `<div class="post-poll"><strong>Poll:</strong><ul>`;

  let totalVotes = 0;

  poll.options.forEach((opt) => {
    const votes = opt.votes_count || 0;
    totalVotes += votes;
    html += `<li>${opt.title} - ${votes} votes</li>`;
  });

  html += `</ul><small>Total votes: ${totalVotes}</small></div>`;

  return html;
}


function renderCard(card) {
  if (!card) return "";
  return `
    <div class="post-card">
      <a href="${card.url}" target="_blank" rel="noopener noreferrer">
        <strong>${card.title}</strong><br/>
        <em>${card.description || ""}</em><br/>
        ${card.image ? `<img src="${card.image}" alt="Card image" class="card-image"/>` : ""}
      </a>
    </div>
  `;
}

function renderReblog(reblog) {
  if (!reblog) return "";

  // Basic info and content only
  const content = reblog.content || "";
  const attachmentsHTML = renderAttachments(reblog.media_attachments);
  const pollHTML = renderPoll(reblog.poll);

  return `
    <div class="reblogged-post" style="border-left: 3px solid #aaa; margin: 10px 0; padding-left: 10px; background: #f9f9f9;">
      <div><strong>Boosted from @${reblog.account.acct}</strong></div>
      <div class="reblog-content">${content}</div>
      ${attachmentsHTML}
      ${pollHTML}
    </div>
  `;
}


function renderPost(post, highlightFavorite = false, isFollowing = false, isExtensionPost = false) {
  const content = post.content || "";
  const attachmentsHTML = renderAttachments(post.media_attachments);
  const pollHTML = renderPoll(post.poll);
  const cardHTML = renderCard(post.card);
  const reblogHTML = renderReblog(post.reblog);

  const wrapper = document.createElement("div");
  wrapper.className = "post";
  wrapper.dataset.postId = post.id;

  // Highlight favorite posts visually
  const favClass = highlightFavorite ? "fav-highlight" : "";

  wrapper.innerHTML = `
    <div class="post-header">
      <div>
        <strong>${post.account.display_name || post.account.username}</strong>
        <button class="follow-btn" data-account-id="${post.account.id}" data-following="${isFollowing}">
          ${isFollowing ? "Unfollow" : "Follow"}
        </button><br/>
        <small>@${post.account.acct}</small><br/>
        <small>${formatDate(post.created_at)}</small>
      </div>
    </div>
    <div class="post-content">${content}</div>
    ${attachmentsHTML}
    ${pollHTML}
    ${cardHTML}
    ${reblogHTML}
    <div class="post-actions">
  <button class="fav-btn ${favClass}" data-post-id="${post.id}" aria-label="Favorite post">
    ${favoritedPostIds.has(post.id) ? "❤️" : "🤍"}
  </button>
   ${isExtensionPost ? `<button class="delete-btn" data-post-id="${post.id}">Delete</button>` : ""}
</div>

  `;
  return wrapper;
}

function clearContainers() {
  postsFromFollowedContainer.innerHTML = "";
  favoritedPostsContainer.innerHTML = "";
  extensionPostsContainer.innerHTML = "";
  otherPostsContainer.innerHTML = "";
}

// Favorite button listener
function attachFavListeners() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.onclick = async () => {
      const postId = btn.dataset.postId;
      const isFavorited = favoritedPostIds.has(postId);

      btn.disabled = true;
      clearError();

      try {
        if (isFavorited) {
          // Unfavorite
          await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}/unfavourite`, {
            method: "POST",
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          });
          favoritedPostIds.delete(postId);
          btn.innerText = "🤍";
          btn.classList.remove("fav-highlight");
        } else {
          // Favorite
          await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}/favourite`, {
            method: "POST",
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          });
          favoritedPostIds.add(postId);
          btn.innerText = "❤️";
          btn.classList.add("fav-highlight");
        }
      } catch (e) {
        showError(`Error toggling favorite: ${e.message}`);
      } finally {
        btn.disabled = false;
      }
    };
  });
}

// follow-helper
async function fetchRelationships(accountIds) {
  const idsParam = accountIds.map(id => `ids[]=${id}`).join('&');
  const url = `${MASTODON_BASE_URL}/api/v1/accounts/relationships?${idsParam}`;

  try {
    const rels = await fetchJSON(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    // rels is an array of relationship objects matching accountIds order
    // Each has `id` and `following` property
    const followingMap = new Map();
    rels.forEach(r => {
      followingMap.set(r.id, r.following);
    });
    return followingMap;
  } catch (e) {
    showError(`Failed to fetch relationships: ${e.message}`);
    return new Map();
  }
}


// follow-unfollow
function attachFollowListeners() {
  document.querySelectorAll(".follow-btn").forEach(btn => {
    btn.onclick = async () => {
      const accountId = btn.dataset.accountId;
      const isFollowing = btn.dataset.following === "true";

      btn.disabled = true;
      clearError();

      try {
        const url = `${MASTODON_BASE_URL}/api/v1/accounts/${accountId}/${isFollowing ? "unfollow" : "follow"}`;
        const response = await fetchJSON(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        });

        // Update button text and data
        btn.textContent = response.following ? "Unfollow" : "Follow";
        btn.dataset.following = response.following;

        // <-- Add this line to refresh all posts after follow/unfollow change:
        await loadAndRenderAllSections();

      } catch (e) {
        showError(`Error toggling follow: ${e.message}`);
      } finally {
        btn.disabled = false;
      }
    };
  });
}

// Load posts from API: people you follow (timeline endpoint)
async function fetchPostsFromFollowed(limit = 20) {
  const url = `${MASTODON_BASE_URL}/api/v1/timelines/home?limit=${limit}`;
  const posts = await fetchJSON(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
  return posts;  // Array of status objects
}


function extractHashtagFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.hostname + parsedUrl.pathname;
    return path.replace(/[^\w]/g, '_').toLowerCase();
  } catch {
    return "wikipedia";
  }
}




// Load favorited posts by fetching status by IDs saved locally (for demo)
async function fetchFavoritedPosts(limit = 10) {
  try {
    const url = `${MASTODON_BASE_URL}/api/v1/favourites?limit=${limit}`;
    const data = await fetchJSON(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    return data; // array of favorited posts
  } catch (e) {
    showError(`Error loading favorited posts: ${e.message}`);
    return [];
  }
}


// Load posts created via this extension (IDs stored locally)
async function fetchExtensionPosts() {
  if (extensionPostIds.size === 0) return [];
  const posts = [];
  for (const id of extensionPostIds) {
    try {
      const post = await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      });
      posts.push(post);
    } catch {
      // ignore
    }
  }
  return posts;
}

// Load other posts: fetch generic public timeline and exclude above categories
async function fetchOtherPosts(limit = 0) {
  try {
    const url = `${MASTODON_BASE_URL}/api/v1/timelines/public?limit=${limit}&local=true`;
    const posts = await fetchJSON(url);
    // Filter out posts already in favorited or extension or followed posts
    return posts.filter(
      p => !favoritedPostIds.has(p.id) && !extensionPostIds.has(p.id)
    );
  } catch (e) {
    showError(`Error loading other posts: ${e.message}`);
    return [];
  }
}

// Render each section separately
async function loadAndRenderAllSections() {
  try {
    setLoading(true);
    clearError();

    // Clear previous posts
    postsFromFollowedContainer.innerHTML = "";
    favoritedPostsContainer.innerHTML = "";
    extensionPostsContainer.innerHTML = "";
    otherPostsContainer.innerHTML = "";

    // 1. Fetch posts from followed accounts
    // You might want to get the home timeline directly from Mastodon
    const followedPosts = await fetchPostsFromFollowed(20); 

    // Get unique author IDs to check follow status
    const followedAccountIds = [...new Set(followedPosts.map(p => p.account.id))];
    const followedRelationships = await fetchRelationships(followedAccountIds);

    // Render posts from followed accounts
    followedPosts.forEach(post => {
      const isFollowing = followedRelationships.get(post.account.id) || false;
      const postHTML = renderPost(post, false, isFollowing, false);
      postsFromFollowedContainer.appendChild(postHTML);
    });

    // 2. Fetch and render favorited posts
    const favoritedPosts = await fetchFavoritedPosts(10);
    favoritedPosts.forEach(post => {
      const postHTML = renderPost(post, true, true, false);
      favoritedPostsContainer.appendChild(postHTML);
    });

    // 3. Fetch and render posts created by the extension
    const extensionPosts = await fetchExtensionPosts();
    extensionPosts.forEach(post => {
      const postHTML = renderPost(post, false, true, true);
      extensionPostsContainer.appendChild(postHTML);
    });

    // 4. Fetch and render other posts (e.g., public timeline excluding previous posts)
    const otherPosts = await fetchOtherPosts(0);
    otherPosts.forEach(post => {
      const postHTML = renderPost(post, false, false, false);
      otherPostsContainer.appendChild(postHTML);
    });

    // Attach event listeners to all buttons after rendering
    attachFavListeners();
    attachFollowListeners();

  } catch (error) {
    showError("Failed to load posts: " + error.message);
  } finally {
    setLoading(false);
  }
}


// Override createNewPost to save extension posts ids locally
async function createNewPost(content, mediaFiles) {
  clearError();
  setLoading(true);

  try {
    let media_ids = [];

    for (const file of mediaFiles) {
      const mediaId = await uploadMedia(file);
      media_ids.push(mediaId);
    }

    const body = { status: content, media_ids };

    const res = await fetch(`${MASTODON_BASE_URL}/api/v1/statuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to post status");

    const post = await res.json();

    // Save the new post ID locally to mark as extension post
    extensionPostIds.add(post.id);

    alert("Post created successfully!");

    // Clear form inputs
    newPostContent.value = "";
    mediaInput.value = "";

    // Reload all sections
    await loadAndRenderAllSections();
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(false);
  }
}

// Upload media function (unchanged)
async function uploadMedia(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${MASTODON_BASE_URL}/api/v2/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Media upload failed");

  const json = await res.json();
  return json.id;
}

// On DOM load, run the new multi-section loader
window.addEventListener("DOMContentLoaded", () => {
  loadAndRenderAllSections();
});

// Post button logic
document.getElementById("postButton").addEventListener("click", async () => {
  const content = document.getElementById("postInput").value.trim();
  if (!content) {
    showError("Post content cannot be empty.");
    return;
  }
  clearError();
  setLoading(true);

  try {
    // POST to /api/v1/statuses
    const response = await fetch(`${MASTODON_BASE_URL}/api/v1/statuses`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const newPost = await response.json();

    // Save the new post ID locally so we know this post was made via extension
    extensionPostIds.add(newPost.id);

    // Clear input box
    document.getElementById("postInput").value = "";

    // Refresh extension posts section
    await loadExtensionPosts();

  } catch (error) {
    showError(`Failed to post: ${error.message}`);
  } finally {
    setLoading(false);
  }
});

async function loadExtensionPosts() {
  extensionPostsContainer.innerHTML = "";
  if (extensionPostIds.size === 0) {
    extensionPostsContainer.innerHTML = "<p>No posts made via extension yet.</p>";
    return;
  }

  const posts = [];
  for (const id of extensionPostIds) {
    try {
      const post = await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      });
      posts.push(post);
    } catch {
      // Ignore failures, maybe deleted post
    }
  }

  posts.forEach(post => {
    extensionPostsContainer.appendChild(renderPost(p, false, false, true));
  });

  attachFavListeners();
  attachFollowListeners();
}


function attachDeleteListeners() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const postId = btn.dataset.postId;
      if (!confirm("Are you sure you want to delete this post?")) return;

      btn.disabled = true;
      clearError();
      setLoading(true);

      try {
        // Call Mastodon API to delete status
        await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        });

        // Remove from local storage and set
        extensionPostIds.delete(postId);
        saveExtensionPostIds();

        // Remove from UI
        btn.closest(".post").remove();

      } catch (e) {
        showError(`Failed to delete post: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
  });
}

async function fetchPostsByUrlHashtagDomain({ url, hashtag, domain }, limit = 10) {
  // 1. Try posts related to URL (search endpoint for url)
  let posts = await fetchPostsByUrl(url, limit);
  if (posts.length > 0) return posts;

  // 2. If none, try hashtag
  posts = await fetchPostsByHashtag(hashtag, limit);
  if (posts.length > 0) return posts;

  // 3. If still none, try domain (search with domain)
  posts = await fetchPostsByDomain(domain, limit);
  return posts;
}

// Helper: search posts by URL
async function fetchPostsByUrl(url, limit = 10) {
  try {
    const searchUrl = `${MASTODON_BASE_URL}/api/v2/search?q=${encodeURIComponent(url)}&limit=${limit}&type=statuses`;
    const data = await fetchJSON(searchUrl, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    return data.statuses || [];
  } catch {
    return [];
  }
}

// Helper: search posts by hashtag
async function fetchPostsByHashtag(hashtag, limit = 10) {
  if (!hashtag) return [];
  try {
    const url = `${MASTODON_BASE_URL}/api/v1/timelines/tag/${encodeURIComponent(hashtag)}?limit=${limit}`;
    const posts = await fetchJSON(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    return posts || [];
  } catch {
    return [];
  }
}

// Helper: search posts by domain (just do a general search for domain)
async function fetchPostsByDomain(domain, limit = 10) {
  if (!domain) return [];
  try {
    const searchUrl = `${MASTODON_BASE_URL}/api/v2/search?q=${encodeURIComponent(domain)}&limit=${limit}&type=statuses`;
    const data = await fetchJSON(searchUrl, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    return data.statuses || [];
  } catch {
    return [];
  }
}

function showNoPostsMessage(container, message = "No posts available") {
  const msgDiv = document.createElement("div");
  msgDiv.className = "no-posts-message";
  msgDiv.textContent = message;
  container.appendChild(msgDiv);
}
