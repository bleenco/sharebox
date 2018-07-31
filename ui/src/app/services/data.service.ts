import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './api.service';
import { Subject, BehaviorSubject, Subscription, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

export interface FileInfo {
  filename: string;
  filepath: string;
  dirpath: string;
  ext: string;
  mime: string;
  stat: {
    isdir: boolean;
    mode: number;
    modtime: string;
    name: string;
    size: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  currentPath$: BehaviorSubject<string>;
  currentPath: string;
  currentPathSub: Subscription;
  navigateSub: Subscription;
  filesSub: Subscription;
  files$: Subject<FileInfo[]>;
  selectedItems: FileInfo[] = [];
  fetching: boolean;
  createFolderDialog: boolean;
  deleteDialog: boolean;
  copyDialog: boolean;

  constructor(public apiService: ApiService, public router: Router) {
    this.currentPath$ = new BehaviorSubject<string>('init');
    this.files$ = new Subject<FileInfo[]>();
    this.init();
  }

  init(): void {
    this.currentPathSub = this.currentPath$
      .pipe(
        filter(path => path !== 'init'),
        distinctUntilChanged()
      )
      .subscribe(path => {
        if (this.router.routerState.snapshot.url !== path) {
          this.router.navigate([`/${path}`]);
        }
      });

    this.navigateSub = this.router.events
      .pipe(
        filter(x => x instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        if (this.filesSub) {
          this.filesSub.unsubscribe();
        }

        this.fetching = true;

        this.selectedItems = [];
        this.currentPath = event.url.replace('/browse', '');
        this.currentPath$.next(event.url);

        this.filesSub = this.apiService
          .getFiles(event.url.replace('/browse', ''))
          .subscribe(files => {
            this.files$.next(files.data);
            this.fetching = false;
          });
      });
  }

  refresh(): void {
    this.selectedItems = [];
    this.fetching = true;
    this.apiService.getFiles(this.currentPath)
      .subscribe(files => {
        this.files$.next(files.data);
        this.fetching = false;
      });
  }

  downloadFile(filePath: string): void {
    this.apiService.downloadFile(filePath);
  }

  downloadZipArchive(filePaths: string[]): void {
    this.apiService.downloadZipArchive(filePaths);
  }

  createFolder(filePath: string): Observable<any> {
    return this.apiService.createFolder(filePath);
  }

  delete(filePaths: string[]): Observable<any> {
    return this.apiService.delete(filePaths);
  }

  copy(destination: string, filePaths: string[]): Observable<any> {
    return this.apiService.copy(destination, filePaths);
  }
}
