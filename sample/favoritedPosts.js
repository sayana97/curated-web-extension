import {
  fetchPostsByUrlHashtagDomain,
  urlHashtag,
  currentUrl,
  domain,
  filterPostsByUrl,
  fetchJSON
} from './fetchPostsHelper.js';
import { renderPost } from '../sidebar.js';
import { showError, clearError } from './fetchPostsHelper.js'; // assumed available

// Global cache
let favoritedPostIds = new Set();
const favoritedPostsContainer = document.getElementById('favoritedPosts'); // Ensure this exists in sidebar.html

// Fetch user's favorited posts from Mastodon
async function fetchFavoritedPosts(limit = 40) {
  try {
    const url = `${MASTODON_BASE_URL}/api/v1/favourites?limit=${limit}`;
    const data = await fetchJSON(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    favoritedPostIds = new Set(data.map(post => post.id));
    return data;
  } catch (e) {
    showError(`Error loading favorited posts: ${e.message}`);
    return [];
  }
}

// Favorite button handler
function attachFavListeners() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.onclick = async () => {
      const postId = btn.dataset.postId;
      const isFavorited = favoritedPostIds.has(postId);

      btn.disabled = true;
      clearError();

      try {
        const endpoint = isFavorited ? 'unfavourite' : 'favourite';
        await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}/${endpoint}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        });

        if (isFavorited) {
          favoritedPostIds.delete(postId);
          btn.innerText = "🤍";
          btn.classList.remove("fav-highlight");
        } else {
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

// Load and render favorited posts relevant to current URL context
export async function loadAndRenderFavoritedSection() {
  const favoritedPosts = await fetchFavoritedPosts(40);
  const relevantPosts = filterPostsByUrl(favoritedPosts, currentUrl, urlHashtag, domain);

  favoritedPostsContainer.innerHTML = "";

  if (relevantPosts.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "No favorited posts found for this page.";
    msg.className = "no-posts-message";
    favoritedPostsContainer.appendChild(msg);
    return;
  }

  relevantPosts.forEach(post => {
    const postHTML = renderPost(post, true, true, false); // assumed args: (post, showFav, showBoost, showReply)
    favoritedPostsContainer.appendChild(postHTML);
  });

  attachFavListeners();
}
