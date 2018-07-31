import { Injectable, EventEmitter } from '@angular/core';
import { getURL } from './api.service';
import { DataService } from './data.service';
import { UploadOutput, UploadInput, UploadFile, UploaderOptions, UploadStatus } from 'ngx-uploader';
import { filter, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  formData: FormData;
  files: UploadFile[] = [];
  uploadInput: EventEmitter<UploadInput>;
  options: UploaderOptions;
  uploadPath: string;

  constructor(public dataService: DataService) {
    this.options = { concurrency: 0 };
    this.uploadInput = new EventEmitter<UploadInput>();
    this.dataService.currentPath$
      .pipe(
        filter(path => path !== 'init'),
        distinctUntilChanged()
      )
      .subscribe(path => {
        this.uploadPath = path.startsWith('/browse') ? path.substr(7) : path;
      });
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const event: UploadInput = {
        type: 'uploadAll',
        url: getURL() + '/files/upload',
        method: 'POST',
        data: { dirpath: this.uploadPath }
      };

      this.uploadInput.emit(event);
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      // this.dragOver = true;
    } else if (output.type === 'dragOut') {
      // this.dragOver = false;
    } else if (output.type === 'drop') {
      // this.dragOver = false;
    } else if (output.type === 'rejected' && typeof output.file !== 'undefined') {
      console.log(output.file.name + ' rejected');
    }

    this.files = this.files.filter(file => {
      if (file.progress.status === UploadStatus.Done) {
        this.dataService.refresh();
        return false;
      }
      return true;
    });
  }
}
