import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './auth/auth.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule, HttpClientModule, AuthComponent
  ],
  exports:[AuthComponent]
})
export class FeaturesModule { }
