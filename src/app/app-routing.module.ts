import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './features/auth/auth.component';
import { CommonModule } from '@angular/common';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth/callback', component: AuthCallbackComponent }, // Create this component next
  { path: 'auth', component: AuthComponent } // Create this component next
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }),HttpClientModule, CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
