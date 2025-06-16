// fetching based on url , hashtag etc 

export function postMatchesUrl(post, url) {
  if (!post) return false;

  // Check in card url
  if (post.card?.url && post.card.url === url) return true;

  // Check if url is included in content (text)
  const contentText = post.content.replace(/<[^>]*>?/gm, "");
  if (contentText.includes(url)) return true;

  return false;
}

export function postMatchesDomain(post, domain) {
  if (!post) return false;

  if (post.card?.url) {
    try {
      const postUrlDomain = new URL(post.card.url).hostname;
      if (postUrlDomain === domain) return true;
    } catch (e) {
      // invalid url in card
    }
  }

  const contentText = post.content.replace(/<[^>]*>?/gm, "");
  if (contentText.includes(domain)) return true;

  return false;
}

export function postHasHashtag(post, hashtags) {
  if (!post.tags || !Array.isArray(post.tags)) return false;

  return post.tags.some(tag => hashtags.includes(tag.name.toLowerCase()));
}


export async function getPageHashtags() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_HASHTAGS' }, (response) => {
      if (response && response.hashtags) {
        resolve(response.hashtags.map(h => h.toLowerCase()));
      } else {
        resolve([]);
      }
    });
  });
}


// async function getAndRenderPosts() {
//   const { fullUrl, domain } = await getCurrentTabInfo();

//   // Define hashtags you want to check for the page
//   // For example, you could extract hashtags from page or define manually:
//   const pageHashtags = await getPageHashtags(); // Implement this to get hashtags for current page
//   // For now, example hardcoded:
//   // const pageHashtags = ['example', 'news'];

//   const [timeline, favorites, own] = await Promise.all([
//     getTimeline(),
//     getFavorites(),
//     getOwnPosts(),
//   ]);

//   const timelineFilteredByUrl = timeline.filter(post => postMatchesUrl(post, fullUrl));
//   const favoritesFilteredByUrl = favorites.filter(post => postMatchesUrl(post, fullUrl));

//   // If no posts for URL, filter by hashtags
//   const timelineFilteredByHashtag = timelineFilteredByUrl.length === 0
//     ? timeline.filter(post => postHasHashtag(post, pageHashtags))
//     : timelineFilteredByUrl;

//   const favoritesFilteredByHashtag = favoritesFilteredByUrl.length === 0
//     ? favorites.filter(post => postHasHashtag(post, pageHashtags))
//     : favoritesFilteredByUrl;

//   // If still no posts, filter by domain
//   const timelineFinal = timelineFilteredByHashtag.length === 0
//     ? timeline.filter(post => postMatchesDomain(post, domain))
//     : timelineFilteredByHashtag;

//   const favoritesFinal = favoritesFilteredByHashtag.length === 0
//     ? favorites.filter(post => postMatchesDomain(post, domain))
//     : favoritesFilteredByHashtag;

//   const timelineFiltered = timelineFinal.filter(post => post.account.id !== currentUser.id);

//   extensionPosts = own.filter(p => {
//     const plainText = p.content.replace(/<[^>]*>?/gm, ""); // Strip HTML tags
//     return plainText.includes("#viaext");
//   });

//   renderPosts(timelineFiltered, "postsFromFollowed");
//   renderPosts(favoritesFinal, "favoritedPosts");
//   renderPosts(extensionPosts, "extensionPosts");
// }

