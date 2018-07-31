import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.sass']
})
export class DeleteDialogComponent implements OnInit {
  loading: boolean;

  constructor(public dataService: DataService) { }

  ngOnInit() { }

  delete(): void {
    this.loading = true;
    const paths = this.dataService.selectedItems.map(item => item.filepath);
    this.dataService.delete(paths)
      .subscribe(resp => {
        if (resp.status === 200) {
          this.dataService.refresh();
        }
        this.loading = false;
        this.dataService.deleteDialog = false;
      });
  }

}
