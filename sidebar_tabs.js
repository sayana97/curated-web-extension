document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const sections = {
        posts: document.getElementById("section-posts"),
        following: document.getElementById("section-following"),
        followers: document.getElementById("section-followers"),
        curated: document.getElementById("section-curated"),
    };

    const accessToken = 'P9JD_8aCVhaXRQQjj2bjiA_m8ZSDFBqzg0M4_4UnZQE'; // Replace with secure logic
    const apiBaseUrl = 'https://mastodon.social/api/v1';

    // Activate tab
    function activateTab(tabName) {
        tabButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.target === tabName);
        });

        Object.entries(sections).forEach(([key, section]) => {
            section.classList.toggle("active", key === tabName);
        });
    }

    activateTab("posts"); // default

    // Fetch & display following
    // Updated initializeFollowing to add unfollow buttons
    async function initializeFollowing() {
        const container = document.getElementById("followingContent");
        container.innerHTML = '<p>Loading...</p>';
        try {
            const userId = await getCurrentUserId();
            const response = await fetch(`${apiBaseUrl}/accounts/${userId}/following`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<p>You are not following anyone.</p>';
                return;
            }

            data.forEach(user => {
                const div = document.createElement('div');
                div.className = 'user-item';
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.gap = '10px';
                div.style.marginBottom = '10px';

                div.innerHTML = `
                <img src="${user.avatar}" alt="Avatar" width="40" height="40" style="border-radius:50%;">
                <span style="flex-grow:1;">${user.display_name || user.username}</span>
                <button class="unfollow-btn" data-user-id="${user.id}">Unfollow</button>
            `;

                container.appendChild(div);
            });

            // Add event listeners for unfollow buttons
            container.querySelectorAll(".unfollow-btn").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const userIdToUnfollow = e.target.dataset.userId;
                    e.target.disabled = true;
                    e.target.textContent = 'Unfollowing...';

                    try {
                        const unfollowResponse = await fetch(`${apiBaseUrl}/accounts/${userIdToUnfollow}/unfollow`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            }
                        });

                        if (!unfollowResponse.ok) {
                            throw new Error('Failed to unfollow');
                        }

                        // Remove user from UI after successful unfollow
                        e.target.closest('.user-item').remove();

                        // If no more users, show message
                        if (!container.querySelector('.user-item')) {
                            container.innerHTML = '<p>You are not following anyone.</p>';
                        }
                    } catch (error) {
                        console.error('Error unfollowing user:', error);
                        e.target.disabled = false;
                        e.target.textContent = 'Unfollow';
                        alert('Failed to unfollow user. Please try again.');
                    }
                });
            });

        } catch (error) {
            console.error('Error fetching following:', error);
            container.innerHTML = '<p>Error loading followings.</p>';
        }
    }


    // Fetch & display followers
    async function initializeFollowers() {
        const container = document.getElementById("followersContent");
        container.innerHTML = '<p>Loading...</p>';
        try {
            const userId = await getCurrentUserId();
            const response = await fetch(`${apiBaseUrl}/accounts/${userId}/followers`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<p>You have no followers.</p>';
                return;
            }

            data.forEach(user => {
                const div = document.createElement('div');
                div.className = 'user-item';
                div.innerHTML = `
                    <img src="${user.avatar}" alt="Avatar" width="40" height="40" style="border-radius:50%;">
                    <span>${user.display_name || user.username}</span>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching followers:', error);
            container.innerHTML = '<p>Error loading followers.</p>';
        }
    }

    // Get authenticated user's ID
    async function getCurrentUserId() {
        if (window.userInfo && window.userInfo.id) {
            return window.userInfo.id;
        }
        const res = await fetch(`${apiBaseUrl}/accounts/verify_credentials`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const user = await res.json();
        window.userInfo = user;
        return user.id;
    }

    function extractTagParts(str) {
        return str
            .toLowerCase()
            .replace(/^https?:\/\//, '') // remove scheme
            .split(/[\/\._-]+/)          // split by common separators
            .filter(Boolean);            // remove empty
    }


    let fetchedPosts = []; // global or module-level, so you can reuse it outside

    async function loadContextualPosts() {
        const container = document.getElementById("curatedContent");
        container.innerHTML = "<p>Loading curated posts for you...</p>";

        try {
            const userId = await getCurrentUserId();

            // Fetch following list for scoring
            const followingRes = await fetch(`${apiBaseUrl}/accounts/${userId}/following`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const followingList = await followingRes.json();
            const followingIds = new Set(followingList.map(u => u.id));

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentURL = new URL(tab.url);
            const urlObj = new URL(currentURL);
            const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();
            const path = urlObj.href.replace(/\/$/, '').toLowerCase();
            const baseDomain = domain.split('.').slice(0, -1).join('.');

            const fullUrlSearchTerm = currentURL;
            const hashtagFromPath = path.split('/').filter(Boolean).join('_');
            const hashtagFromDomain = baseDomain;

            // Step 0: Fetch user's own posts with #viaext
            let myViaExtPosts = [];
            try {
                const userPostsRes = await fetch(`${apiBaseUrl}/accounts/${userId}/statuses?limit=40`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const userPosts = await userPostsRes.json();
                // myViaExtPosts = userPosts.filter(p =>
                //     p.content.toLowerCase().includes('viaext')
                // );
                const lcFullUrl = path.toLowerCase();
                const lcDomain = domain.toLowerCase();
                const lcHashtagFromPath = hashtagFromPath.toLowerCase();
                const lcHashtagFromDomain = hashtagFromDomain.toLowerCase();

                const tagParts = new Set([
                    ...extractTagParts(path),
                    // ...extractTagParts(domain),
                ]);

                myViaExtPosts = userPosts.filter(p => {
                    const content = p.content.toLowerCase();
                    const tagNames = (p.tags || []).map(tag => tag.name.toLowerCase());

                    const isViaExt = content.includes('viaext') || tagNames.includes('viaext');

                    const matchesContext =
                        [...tagParts].some(part =>
                            content.includes(part) || tagNames.includes(part)
                        );

                    return isViaExt && matchesContext;
                });



            } catch (e) {
                console.error("Failed to fetch user's #viaext posts:", e);
            }

            let posts = [];

            // 1. Exact URL search
            try {
                const res1 = await fetch(
                    `https://mastodon.social/api/v2/search?q=${encodeURIComponent(fullUrlSearchTerm)}&resolve=true`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const data1 = await res1.json();
                if (data1.statuses?.length > 0) posts = data1.statuses;
            } catch (e) {
                console.error('Exact URL search failed:', e);
            }

            // 2. Hashtag from path
            if (posts.length === 0 && hashtagFromPath) {
                try {
                    const hashtagRes1 = await fetch(`https://mastodon.social/api/v2/search?q=%23${encodeURIComponent(hashtagFromPath)}&resolve=true`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    const hashtagData1 = await hashtagRes1.json();
                    if (hashtagData1.statuses?.length > 0) posts = hashtagData1.statuses;
                } catch (e) {
                    console.error('Hashtag (path) search failed:', e);
                }
            }

            // 3. Hashtag from domain
            if (posts.length === 0 && hashtagFromDomain) {
                try {
                    const hashtagRes2 = await fetch(`https://mastodon.social/api/v2/search?q=%23${encodeURIComponent(hashtagFromDomain)}&resolve=true`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    const hashtagData2 = await hashtagRes2.json();
                    if (hashtagData2.statuses?.length > 0) posts = hashtagData2.statuses;
                } catch (e) {
                    console.error('Hashtag (domain) search failed:', e);
                }
            }

            // 4. Fallback: domain search
            if (posts.length === 0) {
                try {
                    const res2 = await fetch(`https://mastodon.social/api/v2/search?q=${encodeURIComponent(domain)}&resolve=true`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    const data2 = await res2.json();
                    posts = data2.statuses || [];
                } catch (e) {
                    console.error('Domain-level search failed:', e);
                }
            }

            // Merge #viaext posts first and remove duplicates
            const allPostsMap = new Map();
            [...myViaExtPosts, ...posts].forEach(post => allPostsMap.set(post.id, post));
            posts = Array.from(allPostsMap.values());

            fetchedPosts = posts;
            const tagParts1 = new Set([
                ...extractTagParts(path),
                ...extractTagParts(domain)
            ]);

            const scoredPosts = posts.map(post => {
                const content = post.content?.toLowerCase() || '';
                const tagNames = (post.tags || []).map(t => t.name.toLowerCase());
                let score = 0;

                if (content.includes(fullUrlSearchTerm)) score += 4;
                if (content.includes(domain)) score += 2;
                if (followingIds.has(post.account.id)) score += 6;
                if (post.favourited) score += 5;

                score += (post.reblogs_count || 0) * 0.5;
                score += (post.favourites_count || 0) * 0.3;
                score += (post.reply_count || 0) * 0.2;

                const ageHours = (Date.now() - new Date(post.created_at)) / 36e5;
                score += Math.max(0, 5 - ageHours);

                if (content.includes('viaext')) score += 2;
                // New: score based on tagParts matches
                for (const part of tagParts1) {
                    if (content.includes(part)) score += 2;
                    if (tagNames.includes(part)) score += 2;
                }


                return { post, score };
            });

            scoredPosts.sort((a, b) => b.score - a.score);

            container.innerHTML = '';

            if (scoredPosts.length === 0) {
                container.innerHTML = '<p>No relevant posts found.</p>';
                return;
            }

            for (const { post } of scoredPosts) {
                const div = document.createElement('div');
                div.className = 'post';

                const isReblog = !!post.reblogged;
                const displayPost = isReblog ? post.reblog : post;

                if (isReblog) {
                    const reblogInfo = document.createElement('div');
                    reblogInfo.className = 'post';
                    reblogInfo.style = 'font-size: 0.85em; color: #666; margin-bottom: 0.25em;';
                    reblogInfo.innerHTML = `🔁 Boosted by <strong>${post.account.display_name || post.account.username}</strong>`;
                    div.appendChild(reblogInfo);
                }

                // Author + Follow button
                const headerDiv = document.createElement('div');
                headerDiv.style.display = 'flex';
                headerDiv.style.alignItems = 'center';
                headerDiv.style.gap = '0.5em';
                headerDiv.style.flexWrap = 'nowrap';

                const avatar = document.createElement('img');
                avatar.src = displayPost.account.avatar;
                avatar.alt = 'avatar';
                avatar.width = 40;
                avatar.height = 40;
                avatar.style.borderRadius = '50%';

                const nameEl = document.createElement('strong');
                nameEl.textContent = displayPost.account.display_name || displayPost.account.username;

                const followBtn = document.createElement('button');
                const isOwnPost = displayPost.account.id === userId;

                if (!isOwnPost) {
                    const isFollowing = followingIds.has(displayPost.account.id);
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

                            await loadContextualPosts();
                        } catch (e) {
                            console.error('Follow/unfollow failed:', e);
                        }
                    });

                    headerDiv.appendChild(followBtn);
                }


                headerDiv.appendChild(avatar);
                headerDiv.appendChild(nameEl);
                headerDiv.appendChild(followBtn);
                div.appendChild(headerDiv);

                // Post content
                const contentP = document.createElement('p');
                contentP.innerHTML = displayPost.content;
                div.appendChild(contentP);

                // Media
                if (displayPost.media_attachments?.length) {
                    displayPost.media_attachments.forEach(media => {
                        let mediaEl;
                        if (media.type === 'image') {
                            mediaEl = document.createElement('img');
                            mediaEl.src = media.preview_url || media.url;
                            mediaEl.style.maxWidth = '100%';
                            mediaEl.style.marginTop = '0.5em';
                        } else if (media.type === 'video') {
                            mediaEl = document.createElement('video');
                            mediaEl.src = media.url;
                            mediaEl.controls = true;
                            mediaEl.style.maxWidth = '100%';
                            mediaEl.style.marginTop = '0.5em';
                        }
                        if (mediaEl) div.appendChild(mediaEl);
                    });
                }

                // Polls
                if (displayPost.poll) {
                    const pollDiv = document.createElement('div');
                    pollDiv.style.marginTop = '0.5em';
                    pollDiv.innerHTML = `<strong>Poll:</strong> ${displayPost.content}<br>`;
                    displayPost.poll.options.forEach(opt => {
                        pollDiv.innerHTML += `${opt.title} - ${opt.votes_count} votes<br>`;
                    });
                    div.appendChild(pollDiv);
                }

                // Link previews
                if (displayPost.card) {
                    const cardDiv = document.createElement('div');
                    cardDiv.style.border = '1px solid #ccc';
                    cardDiv.style.padding = '0.5em';
                    cardDiv.style.marginTop = '0.5em';
                    cardDiv.innerHTML = `
                    <a href="${displayPost.card.url}" target="_blank" rel="noopener noreferrer">
                        <strong>${displayPost.card.title}</strong>
                    </a>
                    <p>${displayPost.card.description || ''}</p>
                    ${displayPost.card.image ? `<img src="${displayPost.card.image}" style="max-width: 100%;">` : ''}
                `;
                    div.appendChild(cardDiv);
                }

                const timeEl = document.createElement('small');
                timeEl.textContent = `Posted: ${new Date(displayPost.created_at).toLocaleString()}`;
                div.appendChild(timeEl);


                // Favorite/unfavorite button
                const favBtn = document.createElement('button');
                const isFavourited = displayPost.favourited;
                favBtn.innerHTML = isFavourited ? '❤️' : '🤍';
                favBtn.title = isFavourited ? 'Unfavorite' : 'Favorite';
                favBtn.style.border = 'none';
                favBtn.style.background = 'none';
                favBtn.style.cursor = 'pointer';
                favBtn.style.fontSize = '2.25em';

                favBtn.addEventListener('click', async () => {
                    try {
                        const endpoint = isFavourited
                            ? `/statuses/${displayPost.id}/unfavourite`
                            : `/statuses/${displayPost.id}/favourite`;

                        await fetch(`${apiBaseUrl}${endpoint}`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        await loadContextualPosts(); // Refresh the UI to reflect favorite state
                    } catch (e) {
                        console.error('Favorite/unfavorite failed:', e);
                    }
                });

                div.appendChild(favBtn);

                container.appendChild(div);
            }

        } catch (err) {
            console.error("Error loading curated posts:", err);
            container.innerHTML = "<p>Error loading curated posts.</p>";
        }
    }



    // Tab click listeners
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            activateTab(btn.dataset.target);

            if (btn.dataset.target === "following" && !document.getElementById("followingContent").hasChildNodes()) {
                initializeFollowing();
            }

            if (btn.dataset.target === "followers" && !document.getElementById("followersContent").hasChildNodes()) {
                initializeFollowers();
            }
            if (btn.dataset.target === "curated" && !document.getElementById("curatedContent").hasChildNodes()) {
                await loadContextualPosts();
            }
            if (btn.dataset.target === 'posts' && !document.getElementById('postsFromFollowed').hasChildNodes()) {
                // Call your posts tab initializer
                await initializePostsTab();
            }
        });
    });
});
