// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {CertRequest, CertRequestsUpdate} from './server/Cert';
import {AbstractCommitUpdate} from './CommitUpdate';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {cloneDeep} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import {BehaviorSubject, Observable} from 'rxjs';
import {CertService} from '../services/cert.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {RequestUpdateNotification} from '../services/sock-stomp.service';


@Injectable({
  providedIn: 'root'
})
export class ClientCertRequestModel extends AbstractMutableElementsClientModel {
  private static instanceCount = 0;
  public certRequestSubject: BehaviorSubject<CertRequest[]> = new BehaviorSubject<CertRequest[]>([]);
  public certRequestList$: Observable<CertRequest[]> = this.certRequestSubject.asObservable();
  private certRequestMap: Map<number, CertRequest> = new Map<number, CertRequest>();

  public constructor(private certService: CertService) {
    super();
    console.log('ClientCertRequestModel constructor certService: ', certService, ', instanceCount: ',
      ++ClientCertRequestModel.instanceCount);
  }

  public createElementCommitUpdate(newCertRequest: CertRequest[]): AbstractCommitUpdate<CertRequest> {
    const elementCompareResults: DefaultElementCompareHandler<CertRequest> = this.createElementsUpdate(
      this.getCertRequests(), newCertRequest);
    return new CertRequestsUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public refresh() {
    this.certService.getCertRequests().subscribe(certRequests => {
      this.certRequestSubject.next(certRequests);
      certRequests.forEach(certReq => {
        console.log('certReq: ', certReq);
        this.certRequestMap.set(certReq.id, certReq);
      });
      console.log('certRequestMap length: ', this.certRequestMap.size);
    });
  }

  public update(newCertRequest: CertRequest[]): void {
    console.log('ClientCertRequestModel update newCertRequest: ', newCertRequest);
    const certRequestsUpdate: CertRequestsUpdate = this.createElementCommitUpdate(newCertRequest);
    this.lastRequestId = uuidv4();
    this.certService.certRequestsUpdate(certRequestsUpdate, this.lastRequestId).subscribe(
      () => {
        this.refresh();
      },
      (error) => {
        console.log('ClientCertRequestModel update ERROR', error);
      }
    );
  }

  public getCertRequests(): CertRequest[] {
    return cloneDeep(Array.from(this.certRequestMap.values()));
  }

  public doExport(csrId: number, keyPass: string) {
    return this.certService.exportCertRequestKey(csrId, keyPass);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientCertRequestModel notifyStompEvent topic: ', topic, ', messageJson: ',
      messageJson, ', this.lastRequestId: ', this.lastRequestId);

    if (topic === StompVariables.stompChannels.notifyCertRequestsUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      if (this.lastRequestId !== requestUpdateNotification.requestId &&
        requestUpdateNotification.success) {
        console.log('ClientCertRequestModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ',
          requestUpdateNotification, ', this.lastRequestId: ', this.lastRequestId);
        this.refresh();
      }
    }
  }
}
