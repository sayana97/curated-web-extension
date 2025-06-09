
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