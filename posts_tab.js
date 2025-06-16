document.addEventListener("DOMContentLoaded", () => {
    // DOM references to the 4 Posts tab sections
    const postsSections = {
        followed: document.getElementById("postsFromFollowed"),
        favorites: document.getElementById("favoritedPosts"),
        extension: document.getElementById("extensionPosts"),
        other: document.getElementById("otherPosts"),
    };

    const filterDropdown = document.getElementById("postFilter");

    // Your Mastodon API config
    const accessToken = 'P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE';
    const apiBaseUrl = 'https://mastodon.social/api/v1';

    // Cache current user info
    let userInfoCache = null;

    async function isPostContextuallyRelevant(post) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentURL = new URL(tab.url);
        const domain = currentURL.hostname.replace(/^www\./, '').toLowerCase();
        const path = currentURL.href.replace(/\/$/, '').toLowerCase();
        const href = currentURL.href.toLowerCase();

        const content = (post.content || '').toLowerCase();
        const tags = (post.tags || []).map(t => t.name.toLowerCase());

        const urlInContent = content.includes(href);
        const urlTagMatch = tags.includes(path.split('/').filter(Boolean).join('_')) ||
            tags.includes(domain.split('.').slice(0, -1).join('.'));

        return content.includes(href) || urlInContent || urlTagMatch;
    }

    async function getCurrentUserId() {
        if (userInfoCache && userInfoCache.id) return userInfoCache.id;
        const res = await fetch(`${apiBaseUrl}/accounts/verify_credentials`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        userInfoCache = await res.json();
        return userInfoCache.id;
    }

    async function fetchFollowing() {
        const userId = await getCurrentUserId();
        const res = await fetch(`${apiBaseUrl}/accounts/${userId}/following`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return await res.json();
    }

    async function fetchPostsFromFollowed() {
        const followingList = await fetchFollowing();
        const followedIds = followingList.map(u => u.id);

        let posts = [];
        for (const id of followedIds) {
            try {
                const res = await fetch(`${apiBaseUrl}/accounts/${id}/statuses?limit=20`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const userPosts = await res.json();
                posts.push(...userPosts);
            } catch (e) {
                console.error(`Failed fetching posts for followed user ${id}:`, e);
            }
        }

        const filteredPosts = [];
        for (const post of posts) {
            if (await isPostContextuallyRelevant(post)) {
                filteredPosts.push(post);
            }
        }

        return filteredPosts;
    }


    async function fetchFavoritedPosts() {
        const res = await fetch(`${apiBaseUrl}/favourites?limit=40`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const posts = await res.json();

        const filtered = [];
        for (const post of posts) {
            if (await isPostContextuallyRelevant(post)) {
                filtered.push(post);
            }
        }

        return filtered;
    }

    async function fetchViaExtPosts() {
        const userId = await getCurrentUserId();
        const res = await fetch(`${apiBaseUrl}/accounts/${userId}/statuses?limit=40`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const userPosts = await res.json();

        const viaExtPosts = userPosts.filter(p => {
            const content = p.content.toLowerCase();
            const tagNames = (p.tags || []).map(tag => tag.name.toLowerCase());
            return content.includes('viaext') || tagNames.includes('viaext');
        });

        const filtered = [];
        for (const post of viaExtPosts) {
            if (await isPostContextuallyRelevant(post)) {
                filtered.push(post);
            }
        }

        return filtered;
    }


    async function fetchOtherContextualPosts() {
        // Get current active tab URL (Chrome extension context)
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentURL = new URL(tab.url);
        const domain = currentURL.hostname.replace(/^www\./, '').toLowerCase();
        const path = currentURL.href.replace(/\/$/, '').toLowerCase();

        let posts = [];

        try {
            // 1. Exact URL search
            const res1 = await fetch(
                `https://mastodon.social/api/v2/search?q=${encodeURIComponent(currentURL.href)}&resolve=true`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data1 = await res1.json();
            if (data1.statuses?.length > 0) posts = data1.statuses;
        } catch (e) {
            console.error('Exact URL search failed:', e);
        }

        if (posts.length === 0) {
            // 2. Hashtag from path (replace slashes with underscore for hashtag)
            const hashtagFromPath = path.split('/').filter(Boolean).join('_');
            if (hashtagFromPath) {
                try {
                    const res2 = await fetch(
                        `https://mastodon.social/api/v2/search?q=%23${encodeURIComponent(hashtagFromPath)}&resolve=true`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );
                    const data2 = await res2.json();
                    if (data2.statuses?.length > 0) posts = data2.statuses;
                } catch (e) {
                    console.error('Hashtag (path) search failed:', e);
                }
            }
        }

        if (posts.length === 0) {
            // 3. Hashtag from domain
            const hashtagFromDomain = domain.split('.').slice(0, -1).join('.');
            if (hashtagFromDomain) {
                try {
                    const res3 = await fetch(
                        `https://mastodon.social/api/v2/search?q=%23${encodeURIComponent(hashtagFromDomain)}&resolve=true`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );
                    const data3 = await res3.json();
                    if (data3.statuses?.length > 0) posts = data3.statuses;
                } catch (e) {
                    console.error('Hashtag (domain) search failed:', e);
                }
            }
        }

        if (posts.length === 0) {
            // 4. Fallback: domain search
            try {
                const res4 = await fetch(
                    `https://mastodon.social/api/v2/search?q=${encodeURIComponent(domain)}&resolve=true`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const data4 = await res4.json();
                posts = data4.statuses || [];
            } catch (e) {
                console.error('Domain-level search failed:', e);
            }
        }

        return posts;
    }

    // Render posts inside a container
    function renderPosts(container, posts) {
        container.innerHTML = '';

        if (!posts.length) {
            container.innerHTML = '<p>No posts found.</p>';
            return;
        }

        posts.forEach(async post => {
            const isReblog = !!post.reblogged;
            const displayPost = isReblog ? post.reblog : post;

            const postDiv = document.createElement('div');
            postDiv.className = 'post';

            if (isReblog) {
                const boostInfo = document.createElement('div');
                boostInfo.style = 'font-size: 0.85em; color: #666; margin-bottom: 0.25em;';
                boostInfo.textContent = `🔁 Boosted by ${post.account.display_name || post.account.username}`;
                postDiv.appendChild(boostInfo);
            }

            // Author info
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.gap = '0.5em';

            const avatar = document.createElement('img');
            avatar.src = displayPost.account.avatar_static || displayPost.account.avatar;
            avatar.alt = displayPost.account.username;
            avatar.style.width = '32px';
            avatar.style.height = '32px';
            avatar.style.borderRadius = '50%';

            const authorName = document.createElement('strong');
            authorName.textContent = displayPost.account.display_name || displayPost.account.username;

            headerDiv.appendChild(avatar);
            headerDiv.appendChild(authorName);
            // === Follow/Unfollow button ===
            const userId = await getCurrentUserId();
            const isOwnPost = displayPost.account.id === userId;
            if (!isOwnPost) {
                try {
                    const followingRes = await fetch(`${apiBaseUrl}/accounts/${userId}/following`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    const followingList = await followingRes.json();
                    const followingIds = new Set(followingList.map(u => u.id));
                    const isFollowing = followingIds.has(displayPost.account.id);

                    const followBtn = document.createElement('button');
                    followBtn.className = isFollowing ? 'unfollow-btn' : 'follow-btn';
                    followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';

                    followBtn.addEventListener('click', async () => {
                        try {
                            const endpoint = isFollowing
                                ? `/accounts/${displayPost.account.id}/unfollow`
                                : `/accounts/${displayPost.account.id}/follow`;

                            await fetch(`${apiBaseUrl}${endpoint}`, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            // Reload posts to reflect updated state
                            loadPostsTab();
                        } catch (e) {
                            console.error('Follow/unfollow failed:', e);
                        }
                    });

                    headerDiv.appendChild(followBtn);
                } catch (e) {
                    console.error('Failed to fetch following list:', e);
                }
            }

            postDiv.appendChild(headerDiv);

            // Post content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'post-content';
            contentDiv.innerHTML = displayPost.content;
            postDiv.appendChild(contentDiv);

            // Media attachments
            if (displayPost.media_attachments && displayPost.media_attachments.length > 0) {
                const mediaDiv = document.createElement('div');
                mediaDiv.className = 'media-attachments';
                mediaDiv.style.marginTop = '0.5em';

                displayPost.media_attachments.forEach(media => {
                    if (media.type === 'image') {
                        const img = document.createElement('img');
                        img.src = media.preview_url || media.url;
                        img.alt = media.description || 'Image';
                        img.style.maxWidth = '100%';
                        img.style.marginTop = '0.25em';
                        mediaDiv.appendChild(img);
                    } else if (media.type === 'video' || media.type === 'gifv') {
                        const video = document.createElement('video');
                        video.src = media.url;
                        video.controls = true;
                        video.style.maxWidth = '100%';
                        video.style.marginTop = '0.25em';
                        mediaDiv.appendChild(video);
                    } else {
                        const link = document.createElement('a');
                        link.href = media.url;
                        link.textContent = `View ${media.type}`;
                        link.target = "_blank";
                        link.style.display = 'block';
                        link.style.marginTop = '0.25em';
                        mediaDiv.appendChild(link);
                    }
                });

                postDiv.appendChild(mediaDiv);
            }

            // Timestamp
            const timeLink = document.createElement('a');
            timeLink.href = displayPost.url;
            timeLink.target = "_blank";
            timeLink.rel = "noopener noreferrer";
            timeLink.textContent = new Date(displayPost.created_at).toLocaleString();
            timeLink.style.fontSize = '0.75em';
            timeLink.style.color = '#555';
            timeLink.style.display = 'block';
            timeLink.style.marginTop = '0.25em';

            postDiv.appendChild(timeLink);

            // Favorite/unfavorite button
            const favBtn = document.createElement('button');
            favBtn.style.border = 'none';
            favBtn.style.background = 'none';
            favBtn.style.cursor = 'pointer';
            favBtn.style.fontSize = '2.25em';
            favBtn.style.marginTop = '0.25em';

            let isFavourited = displayPost.favourited || false;
            favBtn.textContent = isFavourited ? '❤️' : '🤍';

            favBtn.addEventListener('click', async () => {
                try {
                    const endpoint = isFavourited
                        ? `/statuses/${displayPost.id}/unfavourite`
                        : `/statuses/${displayPost.id}/favourite`;

                    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (res.ok) {
                        isFavourited = !isFavourited;
                        favBtn.textContent = isFavourited ? '❤️' : '🤍';
                    } else {
                        console.error("Favorite/unfavorite failed", await res.text());
                    }
                } catch (e) {
                    console.error("Error toggling favorite:", e);
                }
            });

            postDiv.appendChild(favBtn);

            container.appendChild(postDiv);
        });
    }


    // Load all posts and render
    async function loadPostsTab() {
        const [
            followedPosts,
            favoritedPosts,
            viaExtPosts,
            otherPosts,
        ] = await Promise.all([
            fetchPostsFromFollowed(),
            fetchFavoritedPosts(),
            fetchViaExtPosts(),
            fetchOtherContextualPosts(),
        ]);

        renderPosts(postsSections.followed, followedPosts);
        renderPosts(postsSections.favorites, favoritedPosts);
        renderPosts(postsSections.extension, viaExtPosts);
        renderPosts(postsSections.other, otherPosts);
    }

    // Filter dropdown logic
    filterDropdown.addEventListener("change", () => {
        const val = filterDropdown.value;
        // Headings
        const f1 = document.getElementById("f1"); //follow
        const f2 = document.getElementById("f2"); //fav
        const f3 = document.getElementById("f3"); //extension
        const f4 = document.getElementById("f4"); //other
        switch (val) {
            case "all":
                postsSections.followed.style.display = "";
                postsSections.favorites.style.display = "";
                postsSections.extension.style.display = "";
                postsSections.other.style.display = "";
                f1.style.display = "";
                f2.style.display = "";
                f3.style.display = "";
                f4.style.display = "";
                break;
            case "followed":
                postsSections.followed.style.display = "";
                postsSections.favorites.style.display = "none";
                postsSections.extension.style.display = "none";
                f1.style.display = "";
                f2.style.display = "none";
                f3.style.display = "none";
                f4.style.display = "";
                break;
            case "favorites":
                postsSections.followed.style.display = "none";
                postsSections.favorites.style.display = "";
                postsSections.extension.style.display = "none";
                f1.style.display = "none";
                f2.style.display = "";
                f3.style.display = "none";
                f4.style.display = "";
                break;
            case "extension":
                postsSections.followed.style.display = "none";
                postsSections.favorites.style.display = "none";
                postsSections.extension.style.display = "";
                f1.style.display = "none";
                f2.style.display = "none";
                f3.style.display = "";
                f4.style.display = "";
                break;
        }
    });

    // Expose the tab initializer globally so the main tab script can call it
    // window.initializePostsTab = function () {
    //     loadPostsTab();

    //     // Ensure all sections are visible initially
    //     postsSections.followed.style.display = "";
    //     postsSections.favorites.style.display = "";
    //     postsSections.extension.style.display = "";
    //     postsSections.other.style.display = "";

    //     // Also set dropdown to "all" explicitly
    //     filterDropdown.value = "all";
    // };
    loadPostsTab();
});
