import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html',
  styleUrls: ['./create-folder-dialog.component.sass']
})
export class CreateFolderDialogComponent implements OnInit {
  folderName: string;
  loading: boolean;

  constructor(public dataService: DataService) { }

  ngOnInit() {
    this.folderName = '';
    this.loading = false;
  }

  createFolder(): void {
    this.loading = true;
    this.dataService.createFolder(this.dataService.currentPath + '/' + this.folderName)
      .subscribe(() => {
        this.dataService.refresh();
        this.loading = false;
        this.dataService.createFolderDialog = false;
      });
  }
}
