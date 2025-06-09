document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const sections = {
        posts: document.getElementById("section-posts"),
        following: document.getElementById("section-following"),
        followers: document.getElementById("section-followers"),
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

    // Tab click listeners
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            activateTab(btn.dataset.target);

            if (btn.dataset.target === "following" && !document.getElementById("followingContent").hasChildNodes()) {
                initializeFollowing();
            }

            if (btn.dataset.target === "followers" && !document.getElementById("followersContent").hasChildNodes()) {
                initializeFollowers();
            }
        });
    });
});
