import {
  fetchPostsByUrlHashtagDomain,
  urlHashtag,
  currentUrl,
  domain,
  filterPostsByUrl
} from './postFetcher.js';

import { fetchJSON } from './utils.js';
import { renderPost, showError, clearError } from './uiHelpers.js';

const followedPostsContainer = document.getElementById('postsFromFollowed'); // Make sure this exists

// Fetch posts from people the user follows
async function fetchPostsFromFollowed(limit = 20) {
  const url = `${MASTODON_BASE_URL}/api/v1/timelines/home?limit=${limit}`;
  const posts = await fetchJSON(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
  return posts;
}

// Fetch relationships (follow/unfollow status) for a list of account IDs
async function fetchRelationships(accountIds) {
  const idsParam = accountIds.map(id => `ids[]=${id}`).join('&');
  const url = `${MASTODON_BASE_URL}/api/v1/accounts/relationships?${idsParam}`;

  try {
    const rels = await fetchJSON(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

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

// Attach follow/unfollow button logic
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

        btn.textContent = response.following ? "Unfollow" : "Follow";
        btn.dataset.following = response.following;

        // Optional: reload section
        await loadAndRenderFollowedSection();

      } catch (e) {
        showError(`Error toggling follow: ${e.message}`);
      } finally {
        btn.disabled = false;
      }
    };
  });
}

// Load and render posts from followed users filtered by url/hashtag/domain
export async function loadAndRenderFollowedSection() {
  const followedPosts = await fetchPostsFromFollowed(40);
  const relevantPosts = filterPostsByUrl(followedPosts, currentUrl, urlHashtag, domain);

  followedPostsContainer.innerHTML = "";

  if (relevantPosts.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "No posts from followed people match this page.";
    msg.className = "no-posts-message";
    followedPostsContainer.appendChild(msg);
    return;
  }

  // Get unique author IDs
  const authorIds = [...new Set(relevantPosts.map(post => post.account.id))];
  const followMap = await fetchRelationships(authorIds);

  relevantPosts.forEach(post => {
    const isFollowing = followMap.get(post.account.id);
    const postHTML = renderPost(post, true, true, false);

    // Add follow/unfollow button
    const followBtn = document.createElement("button");
    followBtn.className = "follow-btn";
    followBtn.dataset.accountId = post.account.id;
    followBtn.dataset.following = isFollowing;
    followBtn.textContent = isFollowing ? "Unfollow" : "Follow";

    postHTML.appendChild(followBtn);
    followedPostsContainer.appendChild(postHTML);
  });

  attachFollowListeners();
}
