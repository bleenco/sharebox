import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-copy-dialog',
  templateUrl: './copy-dialog.component.html',
  styleUrls: ['./copy-dialog.component.sass']
})
export class CopyDialogComponent implements OnInit, OnDestroy {
  loading: boolean;
  currentPath: string;

  constructor(public dataService: DataService) { }

  ngOnInit() {
    this.currentPath = this.dataService.currentPath;
  }

  ngOnDestroy() {
    this.currentPath = '/';
  }

  selectedPath(path: string): void {
    this.currentPath = path;
  }

  copy(): void {
    this.loading = true;
    const paths = this.dataService.selectedItems.map(item => item.filepath);
    this.dataService.copy(this.currentPath, paths)
      .subscribe(resp => {
        if (resp.status === 200) {
          this.dataService.refresh();
        }
        this.loading = false;
        this.dataService.copyDialog = false;
      });
  }

}
