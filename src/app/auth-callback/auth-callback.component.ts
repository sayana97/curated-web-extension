import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
})
export class AuthCallbackComponent implements OnInit {
  // constructor(
  //   private route: ActivatedRoute,
  //   private http: HttpClient,
  //   private router: Router
  // ) {}

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   const code = params['code'];
    //   if (code) {
    //     this.exchangeCodeForToken(code);
    //   }
    // });
  }

  // exchangeCodeForToken(code: string) {
  //   const mastodonInstance = 'https://mastodon.social'; // Change to your instance
  //   const clientId = 'isWdLus5ROC3pdbdwDUDfMch9U5-ONheWmOoVHX-nz4';
  //   const clientSecret = 'AJKfTF_PkhhkrlTlA9Lyll0rxYTMl9xDjNRMWsm5cBI';
  //   const redirectUri = 'http://localhost:4200/auth/callback';

  //   const body = new URLSearchParams();
  //   body.set('client_id', clientId);
  //   body.set('client_secret', clientSecret);
  //   body.set('grant_type', 'authorization_code');
  //   body.set('redirect_uri', redirectUri);
  //   body.set('code', code);

  //   this.http
  //     .post(`${mastodonInstance}/oauth/token`, body.toString(), {
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     })
  //     .subscribe(
  //       (response: any) => {
  //         console.log('Access Token:', response.access_token);
  //         localStorage.setItem('access_token', response.access_token); // Store token for future use
  //         this.router.navigate(['/dashboard']); // Redirect to another page
  //       },
  //       (error) => {
  //         console.error('Error fetching token', error);
  //       }
  //     );
  // }
}
