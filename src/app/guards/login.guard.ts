import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard  {

  constructor(private authService: AuthService,
    private router: Router) { }

  canActivate() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
    return !this.authService.isAuthenticated();
  }

}
