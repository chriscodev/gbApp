// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpRequest} from '@angular/common/http';
import {catchError, Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ProgressBarDataInterface, ProgressBarType} from '../interfaces/ProgressBarDataInterface';
import {progressLoader} from '../../shared/helpers/progressLoadHelper';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private subjectImportLoadProgress = new Subject<any>();

  constructor(private http: HttpClient) {
  }

  /**
   * @param formData consist of the data you want to pass as a multipart form
   * @param fileName name of the file so it can display in the modal
   * @param method POST, GET, PUT, DELETE
   * @param url endpoint of API
   * this file tracker is applicable for uploading files with http request
   * @param options 'restart if need to restart after upload'
   */

  public uploadFileTrackerWithRequest(formData: FormData, fileName: string, method: string, url: string,
                                      options?: string): Observable<ProgressBarDataInterface> {
    const req = new HttpRequest(method, url, formData, {
      reportProgress: true // This option enables progress events
    });
    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressLoaded = progressLoader(event.loaded, event.total, fileName, ProgressBarType.IMPORT);
          return {...progressLoaded, options};
        } else if (event.type === HttpEventType.Response) {
          const progressLoaded = progressLoader(100, 100, fileName, ProgressBarType.IMPORT);
          return {...progressLoaded, options, resultReturn: event.body};
        }
      }),
      catchError((error: HttpErrorResponse) => {
          console.error('Bad Request:', error.message);
          const progressLoaded = progressLoader(0, 0, fileName, ProgressBarType.ERROR);
          return of({
            ...progressLoaded,
            options,
            resultReturn: {
              status: error.status,
              message: error.message,
              errorDetails: error.error, // Include server response or additional error details if available
            },
          });
      })
    );
  }

  // import data handler for progress bar
  public sendImportProgress(message: any) {
    this.subjectImportLoadProgress.next(message);
  }

  public clearImportProgress() {
    this.subjectImportLoadProgress.next(null);
  }

  public getImportProgress(): Observable<any> {
    return this.subjectImportLoadProgress.asObservable();
  }
}
