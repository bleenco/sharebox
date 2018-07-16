import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  urlPrefix: string;

  constructor(public http: HttpClient) {
    this.urlPrefix = this.getURL();
  }

  getFiles(path: string): Observable<any> {
    const url = `${this.urlPrefix}/files/browse/${path}`;
    return this.http.get(url)
      .pipe(
        catchError(this.handleError('files/browse'))
      );
  }

  downloadFile(path: string): void {
    const url = `${this.urlPrefix}/files/download/${path}`;
  }

  delete(paths: string[]): Observable<any> {
    const url = `${this.urlPrefix}/files/delete`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { paths };
    return this.http.post(url, body, { headers: headers })
      .pipe(
        catchError(this.handleError('files/delete'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

  private getURL(): string {
    const secure = location.protocol === 'https:' ? true : false;
    const port = location.port === '4200' || location.port === '4505' ? '4505' : '';
    return secure ? `https://${location.hostname}:${port}/api` : `http://${location.hostname}:${port}/api`;
  }
}