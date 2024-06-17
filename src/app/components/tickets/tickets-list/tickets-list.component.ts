import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Ticket } from '../../../interfaces/ticket';
import { TicketsService } from '../../../services/tickets.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LoaderService } from '../../../services/loader.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
  ],
  templateUrl: './tickets-list.component.html',
  styleUrl: './tickets-list.component.scss'
})
export class TicketsListComponent implements OnInit {
  private ticketsService = inject(TicketsService);
  private loaderService = inject(LoaderService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'title', 'status', 'user_id'];
  dataSource!: MatTableDataSource<Ticket>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.load();
    }

  async load() {
    this.loaderService.isLoading.set(true);
    try {
      const values = await this.ticketsService.getValues();
      this.dataSource = new MatTableDataSource(values);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    catch (error) {
      console.log(error);
    }
    this.loaderService.isLoading.set(false);
  }

  async delete(id: string) {
    if (window.confirm("Are you sure?")) {
      try {
        // delete it from server  
        await this.ticketsService.deleteValue(id);
      
        // delete it from client
        const index = this.dataSource.data.findIndex(a => a.id === id); 
        if (index >= 0) {
          this.dataSource.data.splice(index, 1);
        }
      }
      catch (err) {
        console.log(err);
      }
    }
  }

  edit(id: string) { 
  }
 
  add() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { mode: 'add' };

    const dialogRef = this.dialog.open(TicketFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe({
      next: (value: Ticket) => {
        console.log(value);
        if (value) {
          //this.dataSource.data.push(value);
          this.load()
        }
      },
      error: (error) => console.log(error),
    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
