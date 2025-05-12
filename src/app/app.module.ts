import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './features/home/home.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { AuthComponent } from './features/auth/auth.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [BrowserModule, AppRoutingModule,CommonModule,HomeComponent,AppComponent,HttpClientModule,AuthCallbackComponent,AuthComponent],
  declarations: [],
  bootstrap: []
})
export class AppModule {}
