import { Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(value => value.HomeComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./components/auth/register/register.component').then(value => value.RegisterComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login.component').then(value => value.LoginComponent),
        canActivate: [LoginGuard],
      },
      {
        path: 'auth/confirm-verification/:token',
        loadComponent: () => import('./components/auth/confirm-verification/confirm-verification.component').then(value => value.ConfirmVerificationComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./components/auth/reset-password/reset-password.component').then(value => value.ResetPasswordComponent),
        canActivate: [NoAuthGuard],
      },
      {
        path: 'auth/confirm-password-reset/:token',
        loadComponent: () => import('./components/auth/confirm-password-reset/confirm-password-reset.component').then(value => value.ConfirmPasswordResetComponent),
        canActivate: [NoAuthGuard],
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/auth/profile/profile.component').then(value => value.ProfileComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'tickets',
        loadComponent: () => import('./components/tickets/tickets-list/tickets-list.component').then(value => value.TicketsListComponent),
        canActivate: [AuthGuard],
      },

];
