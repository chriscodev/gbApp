// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractClientModel} from './AbstractClientModel';
import {Injectable} from '@angular/core';
import {LocationSettings} from './server/LocationSettings';
import {LocationSettingsService} from '../services/location-settings.service';
import {v4 as uuidv4} from 'uuid';
import {BehaviorSubject, Observable} from 'rxjs';
import {RestartOptionsRequest} from './server/Server';
import {RequestUpdateNotification, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {alertInfo} from '../../shared/helpers/swalHelpers';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {FileUploadService} from '../services/file-upload.service';
import {ProgressBarDataInterface, ProgressBarType} from '../interfaces/ProgressBarDataInterface';
import {progressLoader} from '../../shared/helpers/progressLoadHelper';

@Injectable({
  providedIn: 'root'
})
export class ClientLocationSettingsModel extends AbstractClientModel {
  public locationSubject: BehaviorSubject<LocationSettings> = new BehaviorSubject<LocationSettings>(null);
  public locationSettings$: Observable<LocationSettings> = this.locationSubject.asObservable();

  public constructor(private locSettingsService: LocationSettingsService,
                     private sockStompService: SockStompService,
                     private fileUploadService: FileUploadService
  ) {
    super();
    this.sockStompService.addListener(this);
  }


  public async refresh() {
    console.log('ClientLocationSettingsModel refresh');
    this.locSettingsService.getLocationSettings().subscribe(locSettings => {
      this.locationSubject.next(locSettings);
      console.log('Loc Settings:' + locSettings);
    });
  }

  public async updateLocationSettings(locationSettings: LocationSettings): Promise<any> {
    console.log('ClientLocationSettingsModel update locationSettings: ', locationSettings);
    this.lastRequestId = uuidv4();
    await this.locSettingsService.updateLocationSettings(locationSettings, this.lastRequestId).subscribe(
      () => {
        console.log('ClientLocationSettingsModel update complete, refreshing...');
        this.refresh();
      },
      (error) => {
        console.log('ClientLocationSettingsModel update ERROR', error);
      }
    );
  }

  public createBackup(archiveMessage: string, fileName: string): boolean {
    let downloadSuccess: boolean;
    this.locSettingsService.createBackup(archiveMessage, fileName).subscribe(backupStatus => {
      if (backupStatus) {
        this.locSettingsService.downloadBackupFile(fileName).subscribe({
          next: (event: HttpEvent<any>) => {
            console.log('locSettingsService event', event);
            switch (event.type) {
              case HttpEventType.DownloadProgress:
                if (event.total) {
                  this.fileUploadService.sendImportProgress(
                    progressLoader(event.loaded, event.total, fileName, ProgressBarType.DOWNLOAD));
                }
                break;
              case HttpEventType.Response:
                const blob = new Blob([event.body], {type: 'application/octet-stream'});
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                this.fileUploadService.sendImportProgress(progressLoader(100, 100, fileName, ProgressBarType.DOWNLOAD));
                downloadSuccess = true;
                setTimeout(() => {
                  alertInfo(`GuideBuilder Archival: ${fileName} has been downloaded.`,
                    'GuideBuilder Archival Complete');
                }, 1000);
                break;
            }
          },
          error: (err) => {
            console.error('Download failed', err);
            downloadSuccess = false;
          }
        });

      }
    }, (err) => {
      console.log('Error in creating backup' + err);
      downloadSuccess = false;
    });
    return downloadSuccess;
  }

  public doRestore(file: File, restartOptions: RestartOptionsRequest): Observable<ProgressBarDataInterface> {
    return this.locSettingsService.doRestore(file, restartOptions);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    if (topic === StompVariables.stompChannels.notifyLocationSettingsUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      if (this.lastRequestId !== requestUpdateNotification.requestId &&
        requestUpdateNotification.success) {
        console.log('ClientLocationSettingsModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ',
          requestUpdateNotification);
        this.refresh();
      }
    }
  }
}
