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
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);

  fileName: string = '';
  fileAvatar!: any;

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    avatar: [''],
  });


  constructor() {
    this.loaderService.isLoading.set(true);
    this.profileForm.patchValue({
      name: this.authService.getName(),
      avatar: this.authService.getAvatarUrl({'thumb': '150x150'}),
    });
    this.loaderService.isLoading.set(false);
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    const name: string = this.profileForm.value.name || '';

    this.loaderService.isLoading.set(true);
    try {
      const resChg = await this.authService.changeProfileData(name, this.fileAvatar);
      if (resChg === '') {
          this.messageService.openOk('Changes applied successfully');
        // } 
      } else {
        this.messageService.openError(resChg);
      }
    } catch (error) {
      this.messageService.throwError(error, true);
    }
    this.loaderService.isLoading.set(false);

  }

  async onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.fileAvatar = event.target.files[0];
      this.profileForm.patchValue({ avatar: URL.createObjectURL(this.fileAvatar) }); 
    }
  }
}

