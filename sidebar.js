// (async () => {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   const url = new URL(tab.url);
//   const domain = url.hostname;
//   const feedDiv = document.getElementById('feed');
//   const accessToken = 'VS5BypkS9F7plUaYPSeVZysycCCiLn08FYOdJdB0kC0'; // Replace this

//   document.getElementById('postButton').addEventListener('click', async () => {
//     const postInput = document.getElementById('postInput').value;
//     const finalContent = `${postInput}\n\n(${domain}) #viaExtension`;

//     try {
//       const res = await fetch('https://mastodon.social/api/v1/statuses', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: finalContent })
//       });

//       if (res.ok) {
//         alert('Post published!');
//         window.location.reload();
//       } else {
//         alert('Failed to publish post.');
//         console.error(await res.text());
//       }
//     } catch (e) {
//       alert('Error publishing post.');
//       console.error(e);
//     }
//   });

//   try {
//     const userRes = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const user = await userRes.json();

//     const myPostsRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/statuses`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const myPosts = await myPostsRes.json();

//     const extensionPosts = myPosts.filter(post =>
//       post.content.includes(domain) && post.content.includes('#viaExtension')
//     );

//     const followingRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/following`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const followingList = await followingRes.json();
//     const followingIds = followingList.map(account => account.id);

//     const res = await fetch(`https://mastodon.social/api/v2/search?q=${domain}&resolve=true`);
//     const data = await res.json();
//     let posts = data.statuses;

//     posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//     const followedPosts = posts.filter(post => followingIds.includes(post.account.id));
//     const otherPosts = posts.filter(post => !followingIds.includes(post.account.id));

//     const sortByLink = list => {
//       const withLinks = list.filter(p => p.content.includes('<a '));
//       const withoutLinks = list.filter(p => !p.content.includes('<a '));
//       return [...withLinks, ...withoutLinks];
//     };

//     const sortedPosts = [...sortByLink(followedPosts), ...sortByLink(otherPosts)];

//     feedDiv.innerHTML = `<h2>Posts about ${domain}</h2>`;

//     const renderPosts = (postList, label = null) => {
//       if (label) {
//         const heading = document.createElement('h3');
//         heading.textContent = label;
//         feedDiv.appendChild(heading);
//       }

//       postList.forEach(post => {
//         const div = document.createElement('div');
//         div.className = 'post' +
//           (post.content.includes('<a ') ? ' with-link' : '') +
//           (post.content.includes('#viaExtension') ? ' via-extension' : '');

//         div.innerHTML = `
//           ${post.content}
//           <small>By ${post.account.display_name || post.account.username} on ${new Date(post.created_at).toLocaleString()}</small>
//         `;
//         feedDiv.appendChild(div);
//       });
//     };

//     if (extensionPosts.length > 0) {
//       extensionPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//       renderPosts(extensionPosts, '📝 Your Posts via Extension');
//     }

//     renderPosts(sortedPosts, '🌐 Public Posts');

//   } catch (err) {
//     feedDiv.innerHTML = `<p>Error loading posts</p>`;
//     console.error(err);
//   }
// })();


// (async () => {
//   const feedDiv = document.getElementById('feed');
//   const accessToken = 'VS5BypkS9F7plUaYPSeVZysycCCiLn08FYOdJdB0kC0'; // Replace this

//   document.getElementById('postButton').addEventListener('click', async () => {
//     const postInput = document.getElementById('postInput').value;
//     const domain = new URL(window.location.href).hostname;
//     const finalContent = `${postInput}\n\n(${domain}) #viaExtension`;

//     try {
//       const res = await fetch('https://mastodon.social/api/v1/statuses', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: finalContent })
//       });

//       if (res.ok) {
//         alert('Post published!');
//         window.location.reload();
//       } else {
//         alert('Failed to publish post.');
//         console.error(await res.text());
//       }
//     } catch (e) {
//       alert('Error publishing post.');
//       console.error(e);
//     }
//   });

//   try {
//     const userRes = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const user = await userRes.json();

//     const myPostsRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/statuses`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const myPosts = await myPostsRes.json();

//     const extensionPosts = myPosts.filter(post =>
//       post.content.includes('#viaExtension')
//     );

//     feedDiv.innerHTML = `<h3>Your Posts via Extension</h3>`;

//     extensionPosts.forEach(post => {
//       const div = document.createElement('div');
//       div.className = 'post';
//       div.innerHTML = `
//         ${post.content}
//         <small>By ${post.account.display_name || post.account.username} on ${new Date(post.created_at).toLocaleString()}</small>
//       `;
//       feedDiv.appendChild(div);
//     });

//   } catch (err) {
//     feedDiv.innerHTML = `<p>Error loading posts</p>`;
//     console.error(err);
//   }
// })();


// (async () => {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   const url = new URL(tab.url);
//   const domain = url.hostname;  // This is the domain of the current page
//   const feedDiv = document.getElementById('feed');
//   const accessToken = 'VS5BypkS9F7plUaYPSeVZysycCCiLn08FYOdJdB0kC0';  // Replace with your actual token

//   // Function to render the fetched posts
//   const renderPosts = (postList, label) => {
//     if (label) {
//       const heading = document.createElement('h3');
//       heading.textContent = label;
//       feedDiv.appendChild(heading);
//     }

//     postList.forEach(post => {
//       const div = document.createElement('div');
//       div.className = 'post' +
//         (post.content.includes('<a ') ? ' with-link' : '') +
//         (post.content.includes('#viaExtension') ? ' via-extension' : '');

//       div.innerHTML = `
//         <div>${post.content}</div>
//         <small>By ${post.account.display_name || post.account.username} on ${new Date(post.created_at).toLocaleString()}</small>
//       `;
//       feedDiv.appendChild(div);
//     });
//   };

//   // Post content when the button is clicked
//   document.getElementById('postButton').addEventListener('click', async () => {
//     const postInput = document.getElementById('postInput').value;
//     const finalContent = `${postInput}\n\n(${domain}) #viaExtension`;

//     try {
//       const res = await fetch('https://mastodon.social/api/v1/statuses', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: finalContent })
//       });

//       if (res.ok) {
//         alert('Post published!');
//         window.location.reload();
//       } else {
//         alert('Failed to publish post.');
//         console.error(await res.text());
//       }
//     } catch (e) {
//       alert('Error publishing post.');
//       console.error(e);
//     }
//   });

//   try {
//     // Fetch user credentials and their posts
//     const userRes = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const user = await userRes.json();

//     // Fetch the user's posts
//     const myPostsRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/statuses`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const myPosts = await myPostsRes.json();

//     // Filter posts by the domain and viaExtension hashtag
//     const extensionPosts = myPosts.filter(post =>
//       post.content.includes(domain) && post.content.includes('#viaExtension')
//     );

//     // Get the list of people the user is following
//     const followingRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/following`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     });
//     const followingList = await followingRes.json();
//     const followingIds = followingList.map(account => account.id);

//     // Fetch public posts related to the domain from Mastodon search
//     const res = await fetch(`https://mastodon.social/api/v2/search?q=${domain}&resolve=true`);
//     const data = await res.json();
//     let posts = data.statuses;

//     // Sort posts by creation date
//     posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//     // Filter posts from people the user is following
//     const followedPosts = posts.filter(post => followingIds.includes(post.account.id));
//     const otherPosts = posts.filter(post => !followingIds.includes(post.account.id));

//     // Sort posts to prioritize posts with links
//     const sortByLink = list => {
//       const withLinks = list.filter(p => p.content.includes('<a '));
//       const withoutLinks = list.filter(p => !p.content.includes('<a '));
//       return [...withLinks, ...withoutLinks];
//     };

//     const sortedPosts = [...sortByLink(followedPosts), ...sortByLink(otherPosts)];

//     // Display posts
//     feedDiv.innerHTML = `<h2>Posts about ${domain}</h2>`;
//     if (extensionPosts.length > 0) {
//       extensionPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//       renderPosts(extensionPosts, '📝 Your Posts via Extension');
//     }

//     renderPosts(sortedPosts, '🌐 Public Posts');

//   } catch (err) {
//     feedDiv.innerHTML = `<p>Error loading posts</p>`;
//     console.error(err);
//   }
// })();


(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;
  const feedDiv = document.getElementById('feed');
  const accessToken = 'VS5BypkS9F7plUaYPSeVZysycCCiLn08FYOdJdB0kC0'; // Replace this

  // document.getElementById('closeSidebarBtn').addEventListener('click', () => {
  //   parent.document.getElementById('mastodon-extension-sidebar').style.right = '-400px';
  //   parent.document.body.style.marginRight = '0';
  // });

  document.getElementById('postButton').addEventListener('click', async () => {
    const postInput = document.getElementById('postInput').value;
    const finalContent = `${postInput}\n\n(${domain}) #viaExtension`;

    try {
      const res = await fetch('https://mastodon.social/api/v1/statuses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: finalContent })
      });

      if (res.ok) {
        alert('Post published!');
        window.location.reload();
      } else {
        alert('Failed to publish post.');
        console.error(await res.text());
      }
    } catch (e) {
      alert('Error publishing post.');
      console.error(e);
    }
  });

  try {
    const userRes = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = await userRes.json();

    const myPostsRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/statuses`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const myPosts = await myPostsRes.json();

    const extensionPosts = myPosts.filter(post =>
      post.content.includes(domain) && post.content.includes('#viaExtension')
    );

    const followingRes = await fetch(`https://mastodon.social/api/v1/accounts/${user.id}/following`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const followingList = await followingRes.json();
    const followingIds = followingList.map(account => account.id);

    const res = await fetch(`https://mastodon.social/api/v2/search?q=${domain}&resolve=true`);
    const data = await res.json();
    let posts = data.statuses;

    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const followedPosts = posts.filter(post => followingIds.includes(post.account.id));
    const otherPosts = posts.filter(post => !followingIds.includes(post.account.id));

    const sortByLink = list => {
      const withLinks = list.filter(p => p.content.includes('<a '));
      const withoutLinks = list.filter(p => !p.content.includes('<a '));
      return [...withLinks, ...withoutLinks];
    };

    const sortedPosts = [...sortByLink(followedPosts), ...sortByLink(otherPosts)];

    feedDiv.innerHTML = `<h2>Posts about ${domain}</h2>`;

    const renderPosts = (postList, label = null) => {
      if (label) {
        const heading = document.createElement('h3');
        heading.textContent = label;
        feedDiv.appendChild(heading);
      }

      postList.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post' +
          (post.content.includes('<a ') ? ' with-link' : '') +
          (post.content.includes('#viaExtension') ? ' via-extension' : '');

        div.innerHTML = `
          ${post.content}
          <small>By ${post.account.display_name || post.account.username} on ${new Date(post.created_at).toLocaleString()}</small>
        `;
        feedDiv.appendChild(div);
      });
    };

    if (extensionPosts.length > 0) {
      extensionPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      renderPosts(extensionPosts, '📝 Your Posts via Extension');
    }

    renderPosts(sortedPosts, '🌐 Public Posts');

  } catch (err) {
    feedDiv.innerHTML = `<p>Error loading posts</p>`;
    console.error(err);
  }
})();