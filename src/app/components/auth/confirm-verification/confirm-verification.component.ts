import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../services/loader.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-confirm-verification',
  standalone: true,
  imports: [],
  templateUrl: './confirm-verification.component.html',
  styleUrl: './confirm-verification.component.scss'
})
export class ConfirmVerificationComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private messageService = inject(MessageService);
  
  @Input('token') token: string = '';

  public error = signal('');

  ngOnInit(): void {
    this.loaderService.isLoading.set(true);
    this.authService.confirmVerification(this.token)
    .then(result => {
      this.error.set(result);
      if (result === '') {
        this.authService.refreshAuthData();
        this.messageService.openOk('Email verified');
        this.router.navigate(['/login']);
      }      
    })
    .catch(err => console.error(err))
    .finally(() => this.loaderService.isLoading.set(false));
  }
}
