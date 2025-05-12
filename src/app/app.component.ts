import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'curated-web-extension';

  likePost() {
    // Implement like post logic
    console.log('Post liked');
  }

  repost() {
    // Implement repost logic
    console.log('Post reposted');
  }

  comment() {
    // Implement comment logic
    console.log('Comment added');
  }
posts = [
  { username: 'User1', userAvatar: 'https://i.pravatar.cc/40', content: 'user updated profile picture!', timestamp: new Date(), likes: 5 },
  { username: 'User2', userAvatar: 'https://i.pravatar.cc/40?img=2', content: 'user updated profile picture!', timestamp: new Date(), likes: 10 }
];


loginWithMastodon() {
  // const mastodonInstanceUrl = 'https://mastodon.social'; // Change this if using another Mastodon instance
  // const clientId = 'isWdLus5ROC3pdbdwDUDfMch9U5-ONheWmOoVHX-nz4'; // Replace with your Mastodon Client ID
  // const redirectUri = encodeURIComponent('http://localhost:4200/auth');
  // const scope = 'read write follow'; // Adjust scopes as needed
  // const authUrl = `${mastodonInstanceUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  // window.location.href = authUrl; // Redirects user to Mastodon login
  // window.location.href = 'https://mastodon.social/auth/sign_in';
  window.location.href = 'https://mastodon.social/public/local';

  
}


}
