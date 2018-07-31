import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './api.service';
import { Subject, BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, tap } from 'rxjs/operators';

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
  currentPathSub: Subscription;
  navigateSub: Subscription;
  filesSub: Subscription;
  files$: Subject<FileInfo[]>;
  fetching: boolean;

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

        this.currentPath$.next(event.url);
        this.fetching = true;
        this.filesSub = this.apiService
          .getFiles(event.url.replace('/browse', ''))
          .subscribe(files => {
            this.files$.next(files.data);
            this.fetching = false;
          });
      });
  }

  refresh(): void {
    const sub = this.currentPath$
      .pipe(
        tap(() => this.fetching = true),
        flatMap(path => this.apiService.getFiles(path.replace('/browse', '')))
      )
      .subscribe(files => {
        this.fetching = false;
        this.files$.next(files.data);
        this.fetching = false;
      }, err => console.error(err), () => sub.unsubscribe());
  }

  downloadFile(filePath: string): void {
    this.apiService.downloadFile(filePath);
  }

  downloadZipArchive(filePaths: string[]): void {
    this.apiService.downloadZipArchive(filePaths);
  }
}
