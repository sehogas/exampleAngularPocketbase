import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientResponseError } from 'pocketbase';
import { Observable, of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private snackBar = inject( MatSnackBar);
  
  throwError(err: any, visualizar: boolean = false): Observable<string | null> {
    const messageError = this.throwMessageError(err, visualizar);
    return( of(messageError) );
  }

  throwMessageError(err: any, visualizar: boolean = false): string {
    let messageError: string = '';
    if (err instanceof AjaxError) {
      switch (err.status) {
        case 0: 
          messageError = "0 - Unable to connect to the server"
          break;
        case 401:
          messageError = "401 - You are not authorized to run this process"
          break;
        case 403:
          messageError = "403 - You are not authorized to run this process"
          break;
        case 404:
          messageError = "404 - Resource not found"
          break;
        case 400:
          messageError = "400 - Bad request";
          break;
        case 500:
          messageError = "500 - Internal server error";
          break;
      }
    }
    if (err instanceof ClientResponseError) {
      messageError = this.throwPocketBaseError(err);
    }
    if (visualizar && messageError) this.openError(messageError);
    return messageError;
  }

  private throwPocketBaseError(err: ClientResponseError): string {
    // console.log(err.originalError);
    // console.log(err.response);

    if (err.response['data']?.email?.message) {
      return err.response['data']?.email?.message;
    }
  
    if (err.response['data']?.avatar?.message) {
      return err.response['data']?.avatar?.message;
    }
  
    if (err?.message) {
      return err.message;
    } 
    if (err.response['message']) {
      return err.response['message'];
    }

    return 'Unexpected error';
  }

  openOk (message: string) {
    this.snackBar.open(message,
      "Ok",  
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['green-snackbar'],
      });
  }

  openInfo (message: string) {
    this.snackBar.open(message,
      "Ok", 
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['yellow-snackbar'],
      });
  }

  openError(message: string) {
    this.snackBar.open(message,
      "Ok", 
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['red-snackbar'],
      });
  }


}
