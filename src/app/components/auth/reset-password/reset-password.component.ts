import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit() {

    if (this.resetForm.invalid) {
      return;
    }

    const email: string = this.resetForm.value.email || '';

    this.loaderService.isLoading.set(true);
    this.authService.resetPassword(email).then( result => {
      if (result === '' || result === 'Please verify your email') {
        if (result === 'Please verify your email') {
          this.messageService.openOk(`Please verify your email at ${email}`);
        }
        this.router.navigate(['/home']);
      } else {
        this.messageService.openError(result);  
      }      
    })
    .catch( err => this.messageService.openError(err) )
    .finally(() => this.loaderService.isLoading.set(false) );
  }

}
