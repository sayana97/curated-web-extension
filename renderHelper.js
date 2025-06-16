
// Renderers
import { parsePostContent } from "./extensionPosts.js";

// export function renderAttachments(attachments) {
  // if (!attachments || attachments.length === 0) return "";
  // let html = '<div class="attachments">';
  // for (const att of attachments) {
  //   if (att.type === "image") {
  //     html += `<img src="${att.url}" alt="image" class="post-image"/>`;
  //   } else if (att.type === "video") {
  //     html += `<video controls class="post-video"><source src="${att.url}" type="${att.mime_type}"></video>`;
  //   } else if (att.type === "audio") {
  //     html += `<audio controls class="post-audio"><source src="${att.url}" type="${att.mime_type}"></audio>`;
  //   }
  // }
  // html += "</div>";
  // return html;
// }

// export function renderAttachments(attachments) {
//   if (!attachments || attachments.length === 0) return "";
//   let html = '<div class="attachments">';
//   for (const att of attachments) {
//     if (att.type === "image") {
//       html += `<img src="${att.url}" alt="image" class="post-image" onerror="this.style.display='none'"/>`;
//     } else if (att.type === "video") {
//       html += `
//         <video controls class="post-video" onerror="this.style.display='none'">
//           <source src="${att.url}" type="${att.mime_type}">
//           Your browser does not support the video tag.
//         </video>`;
//     } else if (att.type === "audio") {
//       html += `
//         <audio controls class="post-audio" onerror="this.style.display='none'">
//           <source src="${att.url}" type="${att.mime_type}">
//           Your browser does not support the audio element.
//         </audio>`;
//     }
//   }
//   html += "</div>";
//   return html;
// }

export function renderPoll(poll) {
  if (!poll) return "";

  let html = `<div class="post-poll"><strong>Poll:</strong><ul>`;

  let totalVotes = 0;

  poll.options.forEach((opt) => {
    const votes = opt.votes_count || 0;
    totalVotes += votes;
    html += `<li>${opt.title} - ${votes} votes</li>`;
  });

  html += `</ul><small>Total votes: ${totalVotes}</small></div>`;

  return html;
}


export function renderCard(card) {
  if (!card) return "";
  return `
    <div class="post-card">
      <a href="${card.url}" target="_blank" rel="noopener noreferrer">
        <strong>${card.title}</strong><br/>
        <em>${card.description || ""}</em><br/>
        ${card.image ? `<img src="${card.image}" alt="Card image" class="card-image"/>` : ""}
      </a>
    </div>
  `;
}

export function renderReblog(reblog) {
  if (!reblog) return "";

  // Basic info and content only
  const content = reblog.content || "";
  const attachmentsHTML = renderAttachments(reblog.media_attachments);
  const pollHTML = renderPoll(reblog.poll);

  return `
    <div class="reblogged-post" style="border-left: 3px solid #aaa; margin: 10px 0; padding-left: 10px; background: #f9f9f9;">
      <div><strong>Boosted from @${reblog.account.acct}</strong></div>
      <div class="reblog-content">${content}</div>
      ${attachmentsHTML}
      ${pollHTML}
    </div>
  `;
}



// new code
export function renderAttachments(attachments) {
  // if (!attachments || attachments.length === 0) return "";
  // let html = '<div class="attachments">';
  // for (const att of attachments) {
  //   if (att.type === "image") {
  //     html += `<img src="${att.url}" alt="image" class="post-image"/>`;
  //   } else if (att.type === "video") {
  //     html += `
  //       <video controls class="post-video">
  //         <source src="${att.url}" type="${att.mime_type}">
  //         Your browser does not support the video tag.
  //       </video>`;
  //   } else if (att.type === "audio") {
  //     html += `
  //       <audio controls class="post-audio">
  //         <source src="${att.url}" type="${att.mime_type}">
  //         Your browser does not support the audio element.
  //       </audio>`;
  //   }
  // }
  // html += "</div>";
  // return html;
}

// export function attachMediaErrorHandlers(container) {
//   if (!container) return;

//   const imgs = container.querySelectorAll('img.post-image');
//   imgs.forEach(img => {
//     img.addEventListener('error', () => {
//       img.style.display = 'none';
//     });
//   });

//   const videos = container.querySelectorAll('video.post-video');
//   videos.forEach(video => {
//     video.addEventListener('error', () => {
//       video.style.display = 'none';
//     });
//   });

//   const audios = container.querySelectorAll('audio.post-audio');
//   audios.forEach(audio => {
//     audio.addEventListener('error', () => {
//       audio.style.display = 'none';
//     });
//   });
// }

// export function renderPoll(poll) {
//   if (!poll) return "";

//   let html = `<div class="post-poll"><strong>Poll:</strong><ul>`;

//   let totalVotes = 0;

//   poll.options.forEach((opt) => {
//     const votes = opt.votes_count || 0;
//     totalVotes += votes;
//     html += `<li>${opt.title} - ${votes} votes</li>`;
//   });

//   html += `</ul><small>Total votes: ${totalVotes}</small></div>`;

//   return html;
// }

// export function renderCard(card) {
//   if (!card) return "";
//   return `
//     <div class="post-card">
//       <a href="${card.url}" target="_blank" rel="noopener noreferrer">
//         <strong>${card.title}</strong><br/>
//         <em>${card.description || ""}</em><br/>
//         ${card.image ? `<img src="${card.image}" alt="Card image" class="card-image"/>` : ""}
//       </a>
//     </div>
//   `;
// }

// export function renderReblog(reblog) {
//   if (!reblog) return "";

//   const content = reblog.content || "";
//   const attachmentsHTML = renderAttachments(reblog.media_attachments);
//   const pollHTML = renderPoll(reblog.poll);

//   return `
//     <div class="reblogged-post" style="border-left: 3px solid #aaa; margin: 10px 0; padding-left: 10px; background: #f9f9f9;">
//       <div><strong>Boosted from @${reblog.account.acct}</strong></div>
//       <div class="reblog-content">${content}</div>
//       ${attachmentsHTML}
//       ${pollHTML}
//     </div>
//   `;
// }


// export function renderReblog(reblog) {
//   if (!reblog) return "";

//   const displayName = reblog.account.display_name || reblog.account.username;
//   const username = reblog.account.acct;
//   const createdTime = timeSince(reblog.created_at);

//   const contentHTML = parsePostContent(reblog.content);

//   const attachmentsHTML = renderAttachments(reblog.media_attachments);
//   const pollHTML = renderPoll(reblog.poll);
//   const cardHTML = renderCard(reblog.card);

//   return `
//     <div class="reblogged-post" style="border-left: 3px solid #aaa; margin: 10px 0; padding-left: 10px; background: #f9f9f9;">
//       <div style="display:flex; align-items:center; gap: 0.5em; margin-bottom: 5px;">
//         <img src="${reblog.account.avatar_static}" alt="avatar" style="width:32px; height:32px; border-radius:50%;">
//         <strong>${displayName}</strong>
//         <span style="color:#555;">@${username}</span>
//         <span style="color:#777; font-size: 0.8em; margin-left:auto;">${createdTime}</span>
//       </div>
//       <div class="reblog-content">${contentHTML}</div>
//       ${attachmentsHTML}
//       ${pollHTML}
//       ${cardHTML}
//     </div>
//   `;
// }

// function timeSince(date) {
//   const seconds = Math.floor((new Date() - new Date(date)) / 1000);
//   let interval = Math.floor(seconds / 31536000);
//   if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
//   return "Just now";
// }
