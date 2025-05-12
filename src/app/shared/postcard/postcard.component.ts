import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-post-card',
  templateUrl: './postcard.component.html',
  styleUrls: ['./postcard.component.css'],
  schemas:[NO_ERRORS_SCHEMA]
})
export class PostCardComponent {
  @Input() post!: { username: string; userAvatar: string; content: string; timestamp: Date; likes: number; };

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
}
