import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  

})
export class AuthComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}
  private apiUrl = 'https://mastodon.social/public/local';  // Change to your Mastodon instance's API URL
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  posts: any[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        this.exchangeCodeForToken(code);
      }
    });
    this.getPosts().subscribe(posts => {
      this.posts = posts;
    }, error => {
      console.error('Error fetching posts:', error);
    });
  }
 // Set the access token when received
 setAccessToken(token: string): void {
  localStorage.setItem('access_token', token);  // Optionally store it for persistence
  this.accessTokenSubject.next(token);
}

// Get the access token from local storage
getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}
  exchangeCodeForToken(code: string) {
    const mastodonInstance = 'https://mastodon.social'; // Change to your instance
    const clientId = 'isWdLus5ROC3pdbdwDUDfMch9U5-ONheWmOoVHX-nz4';
    const clientSecret = 'AJKfTF_PkhhkrlTlA9Lyll0rxYTMl9xDjNRMWsm5cBI';
    const redirectUri = 'http://localhost:4200/auth';

    const body = new URLSearchParams();
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
    body.set('grant_type', 'authorization_code');
    body.set('redirect_uri', redirectUri);
    body.set('code', code);

    this.http
      .post(`${mastodonInstance}/oauth/token`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .subscribe(
        (response: any) => {
          console.log('Access Token:', response.access_token);
          localStorage.setItem('access_token', response.access_token); // Store token for future use
          // this.router.navigate(['/home']); // Redirect to another page
          window.location.reload();

        },
        (error) => {
          console.error('Error fetching token', error);
        }
      );
  }
  getPosts(): Observable<any> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token is not available');
    }

    return this.http.get(this.apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
}
