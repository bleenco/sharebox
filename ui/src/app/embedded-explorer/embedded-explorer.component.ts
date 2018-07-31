import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FileInfo } from '../services/data.service';

@Component({
  selector: 'app-embedded-explorer',
  templateUrl: './embedded-explorer.component.html',
  styleUrls: ['./embedded-explorer.component.sass']
})
export class EmbeddedExplorerComponent implements OnInit {
  @Input() currentPath: string;
  @Output() selectedPath: EventEmitter<string>;

  loading: boolean;
  folders: FileInfo[] = [];

  constructor(public apiService: ApiService) {
    this.selectedPath = new EventEmitter<string>();
  }

  ngOnInit() {
    if (!this.currentPath) {
      this.currentPath = '/';
    }

    this.changePath(this.currentPath, true);
  }

  changePath(path: string, init = false): void {
    if (!init) {
      if (path === '..' || path === '../') {
        const splitted = this.currentPath.split('/');
        splitted.splice(-1, 1);
        this.currentPath = splitted.join('/');
      } else {
        const splitted = this.currentPath.split('/');
        splitted.push(path);
        this.currentPath = splitted.join('/');
      }
    }

    this.loading = true;
    this.apiService.getFiles(this.currentPath).subscribe(resp => {
      if (resp.data && resp.data.length) {
        this.folders = resp.data.filter(item => !!item.stat.isdir);
      } else {
        this.folders = [];
      }
      this.loading = false;
    });

    this.selectedPath.emit(this.currentPath);
  }
}
