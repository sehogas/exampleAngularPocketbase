import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services/auth.service';
import { matchValidator, notPatternValidator, patternValidator } from '../../../util/form-validators';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(3)]],
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

    console.log(this.registerForm.get('passwordConfirm')?.errors)

    if (this.registerForm.invalid) {
      return;
    }

    const email: string = this.registerForm.value.email || '';
    const name: string = this.registerForm.value.name || '';
    const password: string = this.registerForm.value.password || '';
    const passwordConfirm: string = this.registerForm.value.passwordConfirm || '';

    this.loaderService.isLoading.set(true);
    this.authService.register(email, password, passwordConfirm, name).then( result => {
      this.authService.refreshAuthData();
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
