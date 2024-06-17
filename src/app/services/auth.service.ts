import { Injectable, inject, signal } from '@angular/core';
import PocketBase, { AdminModel, AuthModel, FileOptions, RecordModel } from 'pocketbase';
import { environment } from '../../environments/environment';
import { HttpRequest } from '@angular/common/http';
import { MessageService } from './message.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private messageService = inject(MessageService);
  
  private pb = new PocketBase(environment.apiUrl);

  public MSG_VERIFY_EMAIL = 'Please verify your email';

  public isAuthenticated = signal<boolean>(false);


  constructor() {
    this.refreshAuthData();
  }

  public getUserID(): string {
    return this.pb.authStore.model?.['id'] || '';
  }

  public getName(): string {
    return this.pb.authStore.model?.['name'] || '';
  }

  public getEmail(): string {
    return this.pb.authStore.model?.['email'] || '';
  }

  public getToken(): string {
    return this.pb.authStore.token || '';
  }

  public refreshAuthData() {
    this.isAuthenticated.set(this.pb.authStore.isValid);
  }

  private getModel() {
    return this.pb.authStore.isValid ? this.pb.authStore.model : undefined;
  }

  // public async autoRefresh() {
  //   await this.pb.collection('users').authRefresh();
  //   this.isAuthenticated.set(this.pb.authStore.isValid);
  // }

  public addTokenHeader(request: HttpRequest<any>) : HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `User ${ this.getToken() }`,
      }
    });
  }

  public async register(email: string, password: string, passwordConfirm: string, name: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').create({ email: email, password: password, passwordConfirm: passwordConfirm, name: name })
        if (res) {
          const verified: boolean = res['verified'] || false;
          if (!verified) {
            const sendEmail = await this.pb.collection('users').requestVerification(email);
            return (sendEmail) ? this.MSG_VERIFY_EMAIL : 'Error sending verification email';
          }
          return '';
        } else {
          return 'Error registering user';
        }
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error registering user';
      }
    }
    return auth();
  }

  public async authWithPassword(email: string, password: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').authWithPassword(email, password);
        return (res['token'] != '') ? '' : 'Credentials are not valid';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Credentials are not valid';
      }
    }
    return auth();
  }

  public async authWithOAuth2(provider: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').authWithOAuth2({ provider: provider });

        // I try to update name and avatar
        const avatarUrl = res?.['meta']?.['avatarUrl'] || '';
        const name = res?.['meta']?.['name'] || '';
        if (res.record['avatar'] === '' || res.record['name'] === '') {
          const response = await fetch(avatarUrl);
          if (response.ok) {
            const avatar = await response.blob();
            const values = (res.record['avatar'] === '') ? { name: name, avatar: avatar } : { avatar: avatar };
            await this.pb.collection('users').update(res.record.id, values);
          }
        }
        // ********************************

        return (res['token'] != '') ? '' : 'Invalid credentials';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Invalid credentials';
      }
    }
    return auth();
  }

  public async confirmVerification(token: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').confirmVerification(token);
        return (res) ? '' : 'Error confirm verification';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error confirm verification';       
      }
    }
    return auth();
  }

 
  public async resetPassword(email: string): Promise<string>  {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').requestPasswordReset(email);
        return (res) ? this.MSG_VERIFY_EMAIL : 'Error sending password reset email';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error sending password reset email';       
      }
    }
    return auth();
  }

  public async confirmPasswordReset(token: string, password: string, passwordConfirm: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
        return (res) ? '' : 'Error reseting password';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error reseting password';       
      }
    }
    return auth();
  }

  public async requestEmailChange(email: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').requestEmailChange(email);
        return (res) ? '' : 'Error request email change';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error request email change';       
      }
    }
    return auth();
  }

  public async confirmEmailChange(token: string, password: string): Promise<string> {
    const auth = async () => {
      try {
        const res = await this.pb.collection('users').confirmEmailChange(token, password);
        return (res) ? '' : 'Error confirm email change';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error confirm email change';       
      }
    }
    return auth();
  }

  public async changeProfileData(name: string, avatar: any): Promise<string> {
    const auth = async () => {
      try {
        const values = (avatar) ? { name: name, avatar: avatar } : { name: name };
        const res = await this.pb.collection('users').update(this.getUserID(), values);
        return (res) ? '' : 'Error change profile data';
      } catch (error) {
        return this.messageService.throwMessageError(error, false) || 'Error change profile data';       
      }
    }
    return auth();
  }
  
  // public async changeAvatar(avatar: any): Promise<string> {
  //   const auth = async () => {
  //     try {
  //       if (!avatar) return 'Error changing user avatar';
  //       const res = await this.pb.collection('users').update(this.getUserID(), { avatar: avatar });
  //       console.log(res);
  //       return (res) ? '' : 'Error changing user avatar';
  //     } catch (error) {
  //       return this.messageService.throwMessageError(error, false) || 'Error changing user avatar';       
  //     }
  //   }
  //   return auth();
  // }


  public logout(): void {
    this.pb.authStore.clear();
    this.refreshAuthData();
  }

  public getAvatarUrl(fileOptions: FileOptions = {}): string | undefined {
    const model = this.getModel();
    if (!model) return undefined;
    if (this.isAdmin(model)) return undefined;
    if (typeof model['avatar'] !== 'string' || !model['avatar']) return undefined;
  
    return this.pb.getFileUrl(model, model['avatar'], fileOptions);
  }

  // public async getAvatar(imgUrl: string): Promise<Blob | undefined> {
  //   const response = await fetch(imgUrl);
  //   if (response.ok) {
  //     const imgBlob = await response.blob();
  //     const imageObjectURL = URL.createObjectURL(imgBlob);
    
  //   }
  //   return undefined;
  // }

  public isAdmin(model: AuthModel | RecordModel | AdminModel | null): model is AdminModel {
    return !!model && !(model as RecordModel)?.collectionId;
  }

}
