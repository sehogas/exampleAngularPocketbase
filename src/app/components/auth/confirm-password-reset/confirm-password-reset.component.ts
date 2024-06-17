import { Component, Input, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LoaderService } from '../../../services/loader.service';
import { MessageService } from '../../../services/message.service';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { matchValidator, notPatternValidator, patternValidator } from '../../../util/form-validators';

@Component({
  selector: 'app-confirm-password-reset',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './confirm-password-reset.component.html',
  styleUrl: './confirm-password-reset.component.scss'
})
export class ConfirmPasswordResetComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private messageService = inject(MessageService);
  
  @Input('token') token: string = '';

  confirmResetForm  = this.fb.group({
    password: ['', [
      Validators.minLength(7),
      Validators.maxLength(15),
      Validators.required,
      patternValidator(/\d/, { hasNumber: true }),
      patternValidator(/[A-Z]/, { hasCapitalCase: true }),
      patternValidator(/[a-z]/, { hasSmallCase: true }),
      notPatternValidator(/^(?=.*\s)/, { hasSpace: true }),
      patternValidator(/[!@#\$&.º|()?¡¿{}]/, { hasSpecialCharacters: true }),
      matchValidator('passwordConfirm', true)]],
    passwordConfirm: ['', [Validators.required, matchValidator('password')]],
  });

  async onSubmit() {

    if (this.confirmResetForm.invalid) {
      return;
    }

    const password: string = this.confirmResetForm.value.password || '';
    const passwordConfirm: string = this.confirmResetForm.value.passwordConfirm || '';

    this.loaderService.isLoading.set(true);
    this.authService.confirmPasswordReset(this.token, password, passwordConfirm).then( result => {
      this.authService.refreshAuthData();
      if (result === '') {
        this.messageService.openOk('Password changed successfully');
        this.router.navigate(['/login']);
      } else {
        this.messageService.openError(result);  
      }      
    })
    .catch( err => this.messageService.openError(err) )
    .finally(() => this.loaderService.isLoading.set(false) );
  }

}
