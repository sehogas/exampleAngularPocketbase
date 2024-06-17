import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TicketsService } from '../../../services/tickets.service';
import { MessageService } from '../../../services/message.service';
import { Ticket } from '../../../interfaces/ticket';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.scss'
})
export class TicketFormComponent implements OnInit {
  private ticketsService = inject(TicketsService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private dialogRef = inject(MatDialogRef<TicketFormComponent>);
  public data: any = inject(MAT_DIALOG_DATA);

  title: string = 'Ticket';

  disabled: boolean = (this.data?.mode === 'view');
  visibleKey: boolean = (this.data?.mode != 'add');

  fg = this.fb.group({
    id: [{ value: '', disabled: true }],
    title: [{ value: '', disabled: this.disabled }, [Validators.required]],
    detail: [{ value: '', disabled: this.disabled }],
    status: [{ value: 'New', disabled: this.disabled }, [Validators.required]],
    collectionId: [{ value: '', disabled: true }],
    collectionName: [{ value: '', disabled: true }],
    created: [{ value: '', disabled: true }],
    updated: [{ value: '', disabled: true }],
    user_id: [{ value: '', disabled: true }]
  });

  statuses: string[] = ['New', 'Open', 'Pending', 'On-hold', 'Solved', 'Closed'];

  ngOnInit(): void {
    if (this.data) {
      switch (this.data.mode) {
        case 'edit':
          this.title = 'Edit ' + this.title;
          break;
        case 'add':
          this.title = 'New ' + this.title;
          this.fg.get('id')?.disable();
          break;
        case 'view':
          this.title = 'View ' + this.title;
          break;
      }
      this.fg.patchValue(this.data.data);
    }
  }

  async onSave(): Promise<void> {
    if (this.fg.valid) {
      try {
        const ticket: Ticket = this.fg.getRawValue();

        if (this.data.data) {
          const res = await this.ticketsService.updateValue(this.data.data.id, ticket);
          if (res) {
            this.messageService.openOk('Record updated');
            this.dialogRef.close(res);
          } else {
            this.messageService.openError("Error updating record");
          }
        } else {
          const res = await this.ticketsService.addValue(ticket);
          if (res) {
            this.messageService.openOk('Record added');
            this.dialogRef.close(res);
          } else {
            this.messageService.openError("Error added record");
          }
        }
      } catch (error) {
        this.messageService.throwError(error, true);
      }
    } else {
      this.fg.markAllAsTouched();
    }
  }



}
