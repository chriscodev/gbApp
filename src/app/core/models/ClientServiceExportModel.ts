// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {BehaviorSubject, Observable, zip} from 'rxjs';
import {SockStompService} from '../services/sock-stomp.service';
import {ExportProfile, ExportStatus, ServiceExportProfileUpdate} from './dtv/network/export/ExportProfile';
import {ServiceExportService} from '../services/service-export.service';
import {v4 as uuidv4} from 'uuid';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {tap} from 'rxjs/operators';
import {StompVariables} from '../subscriptions/stompSubscriptions';

@Injectable({
  providedIn: 'root'
})
export class ClientServiceExportModel extends AbstractMutableElementsClientModel {
  private static instanceCount = 0;

  public serviceExportSubject: BehaviorSubject<ExportProfile[]> = new BehaviorSubject<ExportProfile[]>([]);
  public serviceExport$: Observable<ExportProfile[]> = this.serviceExportSubject.asObservable();
  public serviceExportStatusSubject: BehaviorSubject<ExportStatus[]> = new BehaviorSubject<ExportStatus[]>([]);
  public serviceExportStatus$: Observable<ExportStatus[]> = this.serviceExportStatusSubject.asObservable();

  public constructor(private exportService: ServiceExportService, private sockStompService: SockStompService) {
    super();
    console.log('ClientServiceExportModel constructor exportService: ', exportService, ', instanceCount: ',
      ++ClientServiceExportModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public refresh() {
    this.doServiceExportsRefresh();
  }

  public async update(exportProfiles: ExportProfile[]): Promise<any> {
    console.log('ClientServiceExportModel update exportProfiles: ', exportProfiles);
    const elementCompareResults: DefaultElementCompareHandler<ExportProfile> = this.createElementsUpdate(
      this.serviceExportSubject.getValue(), exportProfiles);
    const exportUpdate: ServiceExportProfileUpdate = new ServiceExportProfileUpdate(elementCompareResults.added,
      elementCompareResults.updated,
      elementCompareResults.deletedIds);
    this.lastRequestId = uuidv4();
    this.exportService.serviceExportProfileUpdate(exportUpdate, this.lastRequestId).subscribe(
      () => {
        this.refresh();
      },
      (error) => {
        console.log('ClientServiceExportModel update ERROR', error);
      }
    );
  }


  private doServiceExportsRefresh() {
    console.log('refreshing service export');
    zip(
      this.exportService.getExportProfiles(),
      this.exportService.getAllExportStatus()
    ).subscribe({
      next: ([exports, allExportStatus]) => {
        console.log('refreshing service exports', exports);
        this.serviceExportSubject.next(exports);
        // console.log('refreshing service exports status', allExportStatus);
        this.serviceExportStatusSubject.next(allExportStatus);
      },
      error: (err) => {
        console.error('Error loading export data:', err);
      }
    });
  }

  public getServiceExportStatusById(id: number): Observable<ExportStatus> {
    console.log('updating the service exportStatus for : ' + id);
    return this.exportService.getServiceExportStatusById(id).pipe(
      tap(exportStatus => {
        const currentStatusArray = this.serviceExportStatusSubject.getValue();
        const statusIndex = currentStatusArray.findIndex(
          status => status.scheduleProfileId === exportStatus.scheduleProfileId);
        if (statusIndex !== -1) {
          currentStatusArray[statusIndex] = exportStatus;
          this.serviceExportStatusSubject.next([...currentStatusArray]);
        }
      })
    );
  }


  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientServiceExportModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyExportStatus) {
      this.refresh();
    }
  }


}
