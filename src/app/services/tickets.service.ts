import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import PocketBase from 'pocketbase';
import { Ticket } from '../interfaces/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private pb = new PocketBase(environment.apiUrl);

  private collectionName = 'tickets';

  async getValues(): Promise<Ticket[]> {
    const records: Ticket[] = await this.pb.collection(this.collectionName).getFullList({
      sort: '-created',
    });
    console.log(records);
    return records;
  }

  async addValue(record: Ticket) {
    record.user_id = this.pb.authStore.model?.['id'];
    const pb = new PocketBase(environment.apiUrl);
    const response: Ticket = await pb.collection(this.collectionName).create(record);
    console.log(response);
    return response;
  }

  async deleteValue(id: string) {
    const pb = new PocketBase(environment.apiUrl);
    const response = await pb.collection(this.collectionName).delete(id);
    return response;
  }

  async getValue(id: string) {
    const pb = new PocketBase(environment.apiUrl);
    const record: Ticket = await pb.collection(this.collectionName).getOne(id);
    return record;
  } 

  async updateValue(id: string, record: Ticket) {
    const pb = new PocketBase(environment.apiUrl);
    const response: Ticket = await pb.collection(this.collectionName).update(id, record);
    return response;
  } 

}
