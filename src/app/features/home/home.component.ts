import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { PostCardComponent } from "../../shared/postcard/postcard.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule],
  schemas:[NO_ERRORS_SCHEMA]
})
export class HomeComponent {
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
  // posts = [
  //   { username: 'User1', userAvatar: 'https://i.pravatar.cc/40', content: 'Hello World!', timestamp: new Date(), likes: 5 },
  //   { username: 'User2', userAvatar: 'https://i.pravatar.cc/40?img=2', content: 'Angular is awesome!', timestamp: new Date(), likes: 10 }
  // ];
  posts =[{}];
}
