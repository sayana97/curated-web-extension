// Constants (make sure these are set elsewhere or imported)
const MASTODON_BASE_URL = 'https://mastodon.social'; // example
const ACCESS_TOKEN = 'P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE';

// Fetch JSON helper
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// Extract hashtag from URL by replacing non-word chars with _
function extractHashtagFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.hostname + parsedUrl.pathname;
    return path.replace(/[^\w]/g, '_').toLowerCase();
  } catch {
    return "wikipedia"; // fallback hashtag
  }
}

// Fetch posts by URL
async function fetchPostsByUrl(url, limit = 10) {
  if (!url) return [];
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

// Fetch posts by hashtag
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

// Fetch posts by domain
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

// Main function to fetch posts based on url, hashtag, then domain (in order)
async function fetchPostsByUrlHashtagDomain({ url, hashtag, domain }, limit = 10) {
  let posts = await fetchPostsByUrl(url, limit);
  if (posts.length > 0) return posts;

  posts = await fetchPostsByHashtag(hashtag, limit);
  if (posts.length > 0) return posts;

  posts = await fetchPostsByDomain(domain, limit);
  return posts;
}

// Show "No posts" message in container
function showNoPostsMessage(container, message = "No posts available") {
  const msgDiv = document.createElement("div");
  msgDiv.className = "no-posts-message";
  msgDiv.textContent = message;
  container.appendChild(msgDiv);
}

// Normalize string helper for filtering
function normalize(str) {
  return (str || "").toLowerCase();
}

// Filter posts by url, hashtag, or domain inside content or tags
function filterPostsByUrl(posts, url, hashtag, domain) {
  // Filter posts containing url in content
  const postsWithUrl = posts.filter(post =>
    normalize(post.content).includes(normalize(url))
  );
  if (postsWithUrl.length > 0) return postsWithUrl;

  // Filter posts containing hashtag in tags or content
  const postsWithHashtag = posts.filter(post => {
    if (post.tags && post.tags.length > 0) {
      return post.tags.some(t => normalize(t.name) === normalize(hashtag));
    }
    return normalize(post.content).includes(`#${normalize(hashtag)}`);
  });
  if (postsWithHashtag.length > 0) return postsWithHashtag;

  // Filter posts containing domain in content
  const postsWithDomain = posts.filter(post =>
    normalize(post.content).includes(normalize(domain))
  );

  return postsWithDomain;
}

// Example usage to get current context info:
const currentUrl = window.location.href;
const urlHashtag = extractHashtagFromUrl(currentUrl);
const domain = new URL(currentUrl).hostname;



function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = msg ? "block" : "none";
}

function clearError() {
  showError("");
}

export {
  fetchPostsByUrlHashtagDomain,
  extractHashtagFromUrl,
  fetchPostsByUrl,
  fetchPostsByHashtag,
  fetchPostsByDomain,
  showNoPostsMessage,
  filterPostsByUrl,
  fetchJSON,
  currentUrl,
  urlHashtag,
  domain
};
