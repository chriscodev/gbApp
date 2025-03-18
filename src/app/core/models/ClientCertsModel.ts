// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {
  Cert,
  CERT_TYPES,
  CertStatus,
  CertsUpdate,
  ExportKeyStoreDescriptor,
  KEY_TYPES,
  KeyStoreDescriptor,
  OCSP_STATUSES
} from './server/Cert';
import {AbstractCommitUpdate} from './CommitUpdate';
import {CertService} from '../services/cert.service';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {cloneDeep} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import {BehaviorSubject, Observable} from 'rxjs';
import {NotifyCertStatusUpdate, NotifyCertsUpdate, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {ProgressBarDataInterface} from '../interfaces/ProgressBarDataInterface';

@Injectable({
  providedIn: 'root'
})
export class ClientCertsModel extends AbstractMutableElementsClientModel {
  private static instanceCount = 0;
  public certsSubject: BehaviorSubject<Cert[]> = new BehaviorSubject<Cert[]>([]);
  public certs$: Observable<Cert[]> = this.certsSubject.asObservable();
  public certsStatusSubject: BehaviorSubject<CertStatus[]> = new BehaviorSubject<CertStatus[]>([]);
  public certsStatus$: Observable<CertStatus[]> = this.certsStatusSubject.asObservable();
  private certMap: Map<number, Cert> = new Map<number, Cert>();

  public constructor(private certService: CertService, private sockStompService: SockStompService) {
    super();
    console.log('ClientCertsModel constructor certService: ', certService, ', instanceCount: ',
      ++ClientCertsModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public createElementCommitUpdate(newCerts: Cert[]): AbstractCommitUpdate<Cert> {
    const elementCompareResults: DefaultElementCompareHandler<Cert> = this.createElementsUpdate(
      this.getCerts(), newCerts);
    return new CertsUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public async refresh() {
    this.doCertTypesRefresh();
    this.doKeyTypesRefresh();
    this.doOCSPStatusesRefresh();
    this.doCertsStatusRefresh();
    this.doCertsRefresh();
  }

  public async update(newCerts: Cert[]) {
    console.log('ClientCertsModel update newCerts: ', newCerts);
    const certsUpdate: CertsUpdate = this.createElementCommitUpdate(newCerts);
    this.lastRequestId = uuidv4();
    await this.certService.certsUpdate(certsUpdate, this.lastRequestId).subscribe(
      () => {
        this.refresh();
      },
      (error) => {
        console.log('ClientCertRequestModel update ERROR', error);
      }
    );
  }

  public getCerts(): Cert[] {
    return cloneDeep(Array.from(this.certMap.values()));
  }

  public listKeystores(file: File, json: KeyStoreDescriptor): Observable<ProgressBarDataInterface> {
    return this.certService.listKeyStores(file, json);
  }

  public importCerts(file: File, json: KeyStoreDescriptor): Observable<ProgressBarDataInterface> {
    return this.certService.importCerts(file, json);
  }

  public viewCert(certId: number): Observable<string> {
    return this.certService.viewCert(certId);
  }

  public printCert(certificate: string): Observable<string> {
    return this.certService.printCert(certificate);
  }

  public async verifyCertById(certId) {
    await this.certService.verifyCertById(certId).subscribe(response => {
      this.doCertsStatusRefresh();
    });
  }

  public doExport(exportCertificates: ExportKeyStoreDescriptor) {
    return this.certService.exportCerts(exportCertificates);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientCertsModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyCertStatusUpdate) {
      const notifyCertsStatusUpdate: NotifyCertStatusUpdate = JSON.parse(messageJson);
      console.log('updated CertStatus:', notifyCertsStatusUpdate.certStatus);
      this.doCertsStatusRefresh();
      // this.updateCertStatusRecord(notifyCertsStatusUpdate.certStatus);
    }
    if (topic === StompVariables.stompChannels.notifyCertsUpdate) {
      const notifyCertsUpdate: NotifyCertsUpdate = JSON.parse(messageJson);
      console.log('updated notifyCertsUpdate:', notifyCertsUpdate.requestId);
      this.refresh();
    }
  }

  updateCertStatusRecord(newCertStatus: CertStatus): void {
    const currentCertStatuses = this.certsStatusSubject.getValue();
    if (currentCertStatuses && Array.isArray(currentCertStatuses)) {
      const updatedCertStatuses = currentCertStatuses.map(certStat => {
        if (certStat.certId === newCertStatus.certId) {
          console.log('Updated Cert Status:', newCertStatus);
          return newCertStatus;
        }
        return certStat;
      });
      console.log('Updated Cert Status Record:', newCertStatus);
      this.certsStatusSubject.next(updatedCertStatuses);
    }
  }

  private doCertsRefresh(): void {
    this.certService.getCerts().subscribe(certs => {
      this.certMap.clear();
      this.certsSubject.next(certs);
      certs?.forEach(cert => {
        this.certMap.set(cert.id, cert);
      });
      console.log('certMap length: ', this.certMap.size);
    });
  }

  private doCertsStatusRefresh(): void {
    this.certService.getCertStatusList().subscribe(certStatusus => {
      this.certsStatusSubject.next(certStatusus);
      console.log('CERT Status: ', certStatusus);
    });

  }

  private doCertTypesRefresh(): void {
    this.certService.getCertTypes().subscribe(certTypes => {
      CERT_TYPES.length = 0;
      certTypes?.forEach(certType => {
        CERT_TYPES.push({certType: certType.certType, displayName: certType.displayName});
      });
      console.log('CERT_TYPES: ', CERT_TYPES);
    });
  }

  private doKeyTypesRefresh(): void {
    this.certService.getKeyTypes().subscribe(keyTypes => {
      KEY_TYPES.length = 0;
      keyTypes?.forEach(keyType => {
        KEY_TYPES.push({keyType: keyType.keyType, displayName: keyType.displayName});
      });
      console.log('KEY_TYPES: ', KEY_TYPES);
    });
  }

  private doOCSPStatusesRefresh(): void {
    this.certService.getOCSPStatuses().subscribe(ocspStatuses => {
      OCSP_STATUSES.length = 0;
      ocspStatuses?.forEach(ocspStatus => {
        OCSP_STATUSES.push({ocspStatus: ocspStatus.ocspStatus, displayName: ocspStatus.displayName});
      });
      console.log('OCSP_STATUSES: ', OCSP_STATUSES);
    });
  }
}
