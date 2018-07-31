import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, FileInfo } from '../services/data.service';
import { FilesFilterPipe } from '../pipes/files-filter.pipe';
import { FoldersFilterPipe } from '../pipes/folders-filter.pipe';
import { Subscription, of, from } from 'rxjs';
import { distinctUntilChanged, filter, delay, concatMap } from 'rxjs/operators';

interface PathType {
  title: string;
  path: string;
}

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.sass']
})
export class BrowseComponent implements OnInit, OnDestroy {
  files: FileInfo[];
  filesSub: Subscription;
  showHidden = false;
  path: string;
  paths: PathType[];
  currentPathSub: Subscription;
  foldersLen: number;
  filesLen: number;
  selectedItems: FileInfo[] = [];
  view: 'Grid View' | 'List View' = 'Grid View';

  constructor(
    public dataService: DataService,
    public router: Router,
    public filesFilter: FilesFilterPipe,
    public foldersFilter: FoldersFilterPipe
  ) { }

  ngOnInit() {
    this.filesSub = this.dataService.files$.subscribe(files => {
      this.files = (files || []).sort((a, b) => a.filename.localeCompare(b.filename));
      this.foldersLen = this.foldersFilter.transform(this.files, this.showHidden).length;
      this.filesLen = this.filesFilter.transform(this.files, this.showHidden).length;
    });

    this.currentPathSub = this.dataService.currentPath$
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(path => {
        this.selectedItems = [];
        this.path = path;
        this.paths = this.path
          .split('/')
          .reduce((acc, curr) => {
            return acc.concat({ title: curr, path: acc.reduce((x, p) => x += '/' + p.title, '') + '/' + curr });
          }, [])
          .filter(p => !!p.title)
          .map(p => {
            p.path = p.path.replace(/%20/g, ' ');
            p.title = p.title.replace(/%20/g, ' ');
            return p;
          });
      });
  }

  ngOnDestroy() {
    if (this.filesSub) {
      this.filesSub.unsubscribe();
    }

    if (this.currentPathSub) {
      this.currentPathSub.unsubscribe();
    }
  }

  changePath(ev: MouseEvent, name: string): void {
    if (ev.metaKey) {
      return;
    }

    const parentRoot: ActivatedRoute = this.router.routerState.root.firstChild;
    if (parentRoot.snapshot.url.map(p => p.path).join('/') === 'browse') {
      const childRoute: ActivatedRoute = parentRoot.firstChild;
      if (childRoute) {
        const route = '/browse/' + childRoute.snapshot.url.map(p => p.path).join('/') + '/' + name;
        this.dataService.currentPath$.next(route);
      }
    }
  }

  changeAbsolutePath(pathIndex: number): void {
    this.dataService.currentPath$.next(this.paths[pathIndex].path.substr(1));
  }

  onSelect(items: FileInfo[]): void { }

  downloadFiles(ev: MouseEvent): void {
    ev.stopPropagation();
    const sub = from(this.selectedItems)
      .pipe(
        filter(item => !item.stat.isdir),
        concatMap(item => of(item).pipe(delay(1000)))
      )
      .subscribe(item => {
        this.dataService.downloadFile(item.filepath);
      }, err => console.error(err), () => {
        sub.unsubscribe();
      });
  }

  downloadZip(ev: MouseEvent): void {
    ev.stopPropagation();
    const filePaths = this.selectedItems.map(item => item.filepath);
    this.dataService.downloadZipArchive(filePaths);
  }
}
