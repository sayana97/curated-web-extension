const MASTODON_BASE_URL = "https://mastodon.social";
const ACCESS_TOKEN = 'P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE';

/**
 * Create a new post via the extension.
 * @param {string} content - The post content
 * @param {FileList} mediaFiles - Optional media files (from file input)
 * @returns {Promise<Object>} - The created post object
 */
export async function createExtensionPost(content, mediaFiles = null) {
    try {
        let mediaIds = [];

        // Upload media if available
        if (mediaFiles && mediaFiles.length > 0) {
            for (const file of mediaFiles) {
                const formData = new FormData();
                formData.append("file", file);

                const media = await fetch(`${MASTODON_BASE_URL}/api/v2/media`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                    body: formData,
                }).then(res => res.json());

                mediaIds.push(media.id);
            }
        }

        // Post status
        const postBody = {
            status: content,
            visibility: "unlisted",
            language: "en",
            media_ids: mediaIds,
        };

        const response = await fetch(`${MASTODON_BASE_URL}/api/v1/statuses`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postBody),
        });

        const post = await response.json();

        // Store ID for identifying extension-created posts
        storeExtensionPostId(post.id);

        return post;
    } catch (error) {
        throw new Error("Error creating post: " + error.message);
    }
}


/**
 * Fetch all posts created by this extension (by matching stored IDs).
 */
export async function fetchExtensionPosts() {
    const ids = loadExtensionPostIds();
    const posts = [];

    for (const id of ids) {
        try {
            const post = await fetch(`${MASTODON_BASE_URL}/api/v1/statuses/${id}`, {
                headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            }).then(res => res.json());

            if (!post.error) posts.push(post);
        } catch (e) {
            console.warn(`Failed to fetch post ${id}:`, e);
        }
    }

    return posts;
}

// Load posts created via this extension (IDs stored locally)
// async function fetchExtensionPosts() {
//   if (extensionPostIds.size === 0) return [];
//   const posts = [];
//   for (const id of extensionPostIds) {
//     try {
//       const post = await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${id}`, {
//         headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
//       });
//       posts.push(post);
//     } catch {
//       // ignore
//     }
//   }
//   return posts;
// }


/**
 * Delete a post created by the extension
 * @param {string} postId 
 */
export async function deleteExtensionPost(postId) {
    try {
        await fetch(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        removeExtensionPostId(postId);
    } catch (error) {
        throw new Error("Failed to delete post: " + error.message);
    }
}


/**
 * Utility: Load extension-created post IDs from localStorage
 */
export function loadExtensionPostIds() {
    try {
        return JSON.parse(localStorage.getItem("extensionPostIds") || "[]");
    } catch {
        return [];
    }
}

/**
 * Utility: Save post ID after posting
 */
export function storeExtensionPostId(id) {
    const ids = loadExtensionPostIds();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem("extensionPostIds", JSON.stringify(ids));
    }
}

/**
 * Utility: Remove post ID after deletion
 */
export function removeExtensionPostId(id) {
    const ids = loadExtensionPostIds().filter(pid => pid !== id);
    localStorage.setItem("extensionPostIds", JSON.stringify(ids));
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
    saveExtensionPostIds(extensionPostIds);

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


export function loadExtensionPostIds() {
  const saved = localStorage.getItem("extensionPostIds");
  return saved ? new Set(JSON.parse(saved)) : new Set();
}

export function storeExtensionPostId(id) {
  const ids = loadExtensionPostIds();
  ids.add(id);
  localStorage.setItem("extensionPostIds", JSON.stringify([...ids]));
}

export function deleteExtensionPostId(id) {
  const ids = loadExtensionPostIds();
  ids.delete(id);
  localStorage.setItem("extensionPostIds", JSON.stringify([...ids]));
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
        const post = await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        });
        const postElem = renderPost(post, false, false, true);
        extensionPostsContainer.appendChild(postElem);

      } catch (e) {
        if (e.message.includes("404")) {
          extensionPostIds.delete(postId);
          saveExtensionPostIds(extensionPostIds);
        } else {
          console.warn(`Failed to fetch post ${postId}: ${e.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
  });
}

async function loadExtensionPosts() {
  clearError();
  extensionPostsContainer.innerHTML = "";

  const postIds = [...extensionPostIds];
  if (postIds.length === 0) return;

  for (const postId of postIds) {
    try {
      const post = await fetchJSON(`${MASTODON_BASE_URL}/api/v1/statuses/${postId}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      });

      const postElem = renderPost(post, false, false, true);
      extensionPostsContainer.appendChild(postElem);
    } catch (e) {
      console.warn(`Failed to fetch post ${postId}: ${e.message}`);
    }
  }

  attachFavListeners();
}

function saveExtensionPostIds(set) {
  localStorage.setItem("extensionPostIds", JSON.stringify([...set]));
}