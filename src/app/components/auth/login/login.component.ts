import { Component, Input, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { LoaderService } from '../../../services/loader.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  
  @Input('returnUrl') returnUrl: string = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    const email: string = this.loginForm.value.email || '';
    const password: string = this.loginForm.value.password || '';
    
    this.loaderService.isLoading.set(true);
    this.authService.authWithPassword(email, password)
    .then( result => {
      this.authService.refreshAuthData();
      if (result === '') {
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.messageService.openError(result);  
      }      
    })
    .catch(err => this.messageService.openError(err))
    .finally(() => this.loaderService.isLoading.set(false));
  }

  loginWithGoogle() {
    this.loaderService.isLoading.set(true);
    this.authService.authWithOAuth2('google')
    .then( result => {
      this.authService.refreshAuthData();
      if (result === '') {
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.messageService.openError(result);  
      }      
    })
    .catch(err => this.messageService.openError(err))
    .finally(() => this.loaderService.isLoading.set(false));
  }
}
