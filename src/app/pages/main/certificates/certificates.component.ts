// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {AfterContentInit, ChangeDetectorRef, Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../core/models/ui/dynamicTable';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {
  Cert,
  CertStatus,
  CertType,
  certTypeToString,
  DefaultCert,
  DefaultCertStatus,
  ExportKeyStoreDescriptor,
  KeyStoreDescriptor,
  KeyStoreEntryDescriptor,
  TranslatedCertData
} from '../../../core/models/server/Cert';
import {ClientCertsModel} from '../../../core/models/ClientCertsModel';
import {cloneDeep, isEqual} from 'lodash';
import {
  ModalDynamicTbTranslateComponent
} from '../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {getCertStatusById, getOSCPProduced, isOnline, isSigned} from '../../../shared/helpers/certUtil';
import * as _swal from '../../../../assets/node_modules/sweetalert/sweetalert';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {ViewCertComponent} from '../../../shared/components/modals/view-cert/view-cert.component';
import {SweetAlert} from 'src/assets/node_modules/sweetalert/sweetalert/typings/core';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';
import {Observable} from 'rxjs';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';
import {ClientTransportsModel} from '../../../core/models/ClientTransportsModel';
import {AbstractTransport, ATSC3Transport, TransportType} from '../../../core/models/dtv/network/physical/Transport';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {ProgressBarDataInterface, ProgressBarType} from '../../../core/interfaces/ProgressBarDataInterface';
import {FileUploadService} from '../../../core/services/file-upload.service';
import {progressLoader} from '../../../shared/helpers/progressLoadHelper';
import {CertService} from '../../../core/services/cert.service';
import {clearFileImportInput} from '../../../shared/helpers/fileImportClearHelper';
import {alertError} from '../../../shared/helpers/swalHelpers';
import {v4 as uuidv4} from 'uuid';

const swal: SweetAlert = _swal as any;
declare var $: BootstrapFunction;

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, AfterContentInit, ComponentCanDeactivate {
  @ViewChild(ModalDynamicTbTranslateComponent) certificatesTableComponent: ModalDynamicTbTranslateComponent;
  @ViewChild(ViewCertComponent) viewCertComponent: ViewCertComponent;
  public title = 'Import Certificate(s)';
  public modalName = '#certModal';
  public objectType = 'Cert';
  public editMode: boolean;
  public confirmDialog = {
    dialogTitle: 'Remove Certificate Confirmation',
    imageSrc: ImageType.confirm,
    message: 'Are you sure you want to remove the selected Certificate',
  };
  public buttonList: ButtonTypes [] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: false, alwaysEnabled: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.VIEW, imgSrc: ImageType.view, supportsMultiSelect: false},
    {name: ButtonType.VERIFY, imgSrc: ImageType.verify, supportsMultiSelect: false},
    {name: ButtonType.EXPORT, imgSrc: ImageType.export, supportsMultiSelect: true}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Type', key: 'type', visible: true, translateField: true},
    {header: 'Online', key: 'online', visible: true, showOnline: true, translateField: true},
    {header: 'Issued To', key: 'name', visible: true},
    {header: 'Issued By', key: 'issuedByCN', visible: true},
    {header: 'Status', key: 'status', visible: true, translateField: true},
    {header: 'OCSP Produced', key: 'OSCPProduced', visible: true, translateField: true, showDate: true}
  ];
  public localCerts: Cert[] = [];
  public importFile: File | null;
  public serverCerts: Cert[] = [];
  public currentCert = new DefaultCert();
  public importCertList: KeyStoreDescriptor[];
  public keyStoreDesc: KeyStoreDescriptor = {password: null, entries: []};
  public importRecord: KeyStoreEntryDescriptor = {password: null, passwordRequired: 'false', alias: ''};
  public privateKeyStorePassword = null;
  public currentCertStatus = new DefaultCertStatus();
  public issuerCertStatus = new DefaultCertStatus();
  public serverCertStatusus: CertStatus[] = [];
  public issuerStatus = true;
  public issuerCert: Cert | null;
  public showPassword: boolean;
  public is509Cert = true;
  public fileName = '';
  public disableImportBtn = true;
  public enableExportBtn = true;
  public exportCertDescriptor: ExportKeyStoreDescriptor = {
    keystorePassword: null,
    privateKeyPassword: null,
    fileName: null,
    certIds: []
  };
  public requiredExportPrivateKey = false;
  public selectedCerts: KeyStoreEntryDescriptor[] = [];
  public translatedCertData: TranslatedCertData[] = [];
  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  overwriteCertData = false;
  modalSelectCert = false;
  overrideCert = new DefaultCert();
  transportList: AbstractTransport[] = [];

  constructor(public certModel: ClientCertsModel, private transportModel: ClientTransportsModel,
              private cdr: ChangeDetectorRef, private fileUploadService: FileUploadService,
              private certService: CertService) {
    super();
    this.showPassword = false;
    this.subscriptions.push(this.fileUploadService.getImportProgress().subscribe((data) => {
      if (data !== undefined) {
        console.log('getImportProgress', data);
        this.progressModalData = data;
      }
    }));
  }

  ngOnInit(): void {
    this.editMode = false;
    this.loadCerts();
  }

  ngAfterContentInit() {
    $('#certModal').on('hidden.bs.modal', () => {
      this.keyStoreDesc = {password: '', entries: []};
    });
  }

  loadCerts() {
    this.subscriptions.push(this.transportModel.transports$.subscribe((transports: AbstractTransport[]) => {
      this.transportList = cloneDeep(transports);
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.certModel.certs$.subscribe((certs: Cert[]) => {
      this.loadServerCerts(certs);
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.certModel.certsStatus$.subscribe((certsStatus: CertStatus[]) => {
      this.loadServerCertStatus(certsStatus);
      this.translateCertRows(this.certModel.certsSubject.getValue());
      this.cdr.detectChanges();
    }));
    this.currentCert = cloneDeep(this.certificatesTableComponent.selectedRow);

  }

  translateCertRows(certs: Cert[]) {
    this.translatedCertData = [];
    const certRows = cloneDeep(certs);
    // this.currentCertStatus = cloneDeep(this.certModel.certsStatusSubject.getValue());
    certRows.forEach((cert: { id?: number; type?: any; }) => {
      if (isDefined(cert)) {
        const certData = new TranslatedCertData(cert.id, this.getCertTypeString(cert.type),
          isOnline(cert.id, this.serverCertStatusus), isSigned(cert, this.serverCertStatusus),
          getOSCPProduced(cert.id, this.serverCertStatusus));
        this.translatedCertData.push(certData);
      }
    });
  }

  onCommit() {
    this.certModel.update(this.localCerts).then(() => this.dirty = false);
  }

  onRevert() {
    this.dirty = false;
    this.loadCerts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadServerCerts(certs: Cert[]) {
    this.serverCerts = cloneDeep(certs);
    this.localCerts = cloneDeep(certs);
    this.translateCertRows(certs);
  }

  loadServerCertStatus(certStatusus: CertStatus[]) {
    this.serverCertStatusus = certStatusus;
  }

  updateDirty() {
    this.dirty = !isEqual(this.localCerts, this.serverCerts);
  }

  public onButtonClicked($event: any) {
    switch ($event.message) {
      case ActionMessage.DELETE: {
        this.onDeleteRows();
        break;
      }
      case ActionMessage.VIEW: {
        this.onViewRows();
        break;
      }
      case ActionMessage.VERIFY: {
        this.currentCert = cloneDeep(this.certificatesTableComponent.selectedRow);
        this.verifyCertConfirmation();
        this.updateDirty();
        break;
      }
      case ActionMessage.EXPORT: {
        this.exportCertDescriptor = {keystorePassword: null, privateKeyPassword: null, fileName: null, certIds: []};
        const exportList = this.certificatesTableComponent.selectedRowIds;
        this.exportCert(exportList);
        break;
      }
      case ActionMessage.ADD: {
        this.modalName = '#certModal';
        this.reset();
        this.currentCert = new DefaultCert();
        break;
      }
    }
  }

  // to enable/disable particular buttons specific to the client class/page or unique condition
  public rowClicked(row: { hasOwnProperty?: any; issuedTo?: any; issuedBy?: any; aki?: any; ski?: any; id?: any; }) {
    const tmpCert = !row?.hasOwnProperty('clientId');
    this.currentCert = cloneDeep(this.certificatesTableComponent?.selectedRow);
    if (!tmpCert && this.currentCert?.id === -1) {
      this.certificatesTableComponent?.disableButtons([ButtonType.VERIFY]);
    } else {
      if (isDefined(this.currentCert) && this.isCertInUse(this.currentCert?.id)) {
        this.certificatesTableComponent.disableButtons([ButtonType.DELETE]);
      }
      if (isDefined(
        this.currentCert) && (this.currentCert.issuedTo === this.currentCert.issuedBy || this.currentCert.aki === this.currentCert.ski)) {
        this.certificatesTableComponent?.disableButtons([ButtonType.VERIFY]);
      }
    }
  }

  onDeleteRows() {
    if (this.certificatesTableComponent.selectedRowIds.length > 0) {
      for (let i = 0; i < this.certificatesTableComponent.selectedRowIds.length; i++) {
        const selectID = this.certificatesTableComponent?.selectedRowIds[i];
        this.localCerts = this.localCerts.filter((cert) => {
          if (cert?.id > -1) {
            return cert.id.toString() !== selectID.toString();
          } else {
            return cert.clientId !== selectID.toString();
          }
        });
      }
    } else {
      this.localCerts = this.localCerts.filter(
        cert => cert.clientId !== this.certificatesTableComponent.selectedRow.clientId);
    }

    this.cdr.detectChanges();
    this.updateDirty();
  }

  onViewRows() {
    this.currentCert = cloneDeep(this.certificatesTableComponent.selectedRow);
    this.currentCertStatus = getCertStatusById(this.currentCert.id, this.serverCertStatusus);
    this.issuerCert = this.serverCerts.find((e: Cert) => e.ski === this.currentCert.aki) || null;
    this.issuerStatus = !(this.issuerCert !== null && !this.currentCert.isSelfSigned);
    if (this.issuerCert?.id) {
      this.issuerCertStatus = getCertStatusById(this.issuerCert.id, this.serverCertStatusus);
    } else {
      this.issuerCertStatus = new DefaultCertStatus();
    }
    this.modalName = '';
    this.viewCert();
  }

  onCheckboxChange(certRecord: KeyStoreEntryDescriptor, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked && !certRecord.passwordRequired) {
      this.selectedCerts.push(certRecord);
      this.disableImportBtn = false;
    } else if (checkbox.checked && certRecord.passwordRequired) {
      this.importRecord = certRecord;
      this.disableImportBtn = true;
      $('#passwordModal').modal('show');
    } else {
      const index = this.selectedCerts.indexOf(certRecord);
      if (index !== -1) {
        this.selectedCerts.splice(index, 1);
      }
    }
  }

  importPrivateKeyCert() {
    if (this.importRecord.passwordRequired && this.privateKeyStorePassword !== null) {
      this.importRecord.password = this.privateKeyStorePassword;
      this.selectedCerts.push(this.importRecord);
      this.disableImportBtn = false;
      if (this.overwriteCertData) {
        this.importCertFile();
        this.cdr.detectChanges();
        this.updateDirty();
      }
    } else {
      this.importPrivateKeyCertCancelled();
    }
  }

  importPrivateKeyCertCancelled() {
    this.disableImportBtn = true;
    $('#' + this.importRecord.alias).prop('checked', false);
    swal('Error', 'Please provide password for the keystore to import.', 'error');
    $('#passwordModal').modal('show');
  }

  exportCertFile() {
    this.openFileUploadModal();
    let downloadSuccess: boolean;
    const observable: Observable<HttpEvent<ArrayBuffer>> = this.certModel.doExport(this.exportCertDescriptor);
    const observer = {
      next: (event: HttpEvent<any>) => {
        console.log('HttpEvent exportCertFile', event);
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progressLoad = progressLoader(event.loaded, event.total, this.exportCertDescriptor.fileName,
                ProgressBarType.DOWNLOAD);
              this.fileUploadService.sendImportProgress(progressLoad);
            }
            break;
          case HttpEventType.Response:
            const blob = new Blob([event.body], {type: 'application/octet-stream'});
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = this.exportCertDescriptor.fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            const progressLoad = progressLoader(100, 100, this.exportCertDescriptor.fileName, ProgressBarType.DOWNLOAD);
            this.fileUploadService.sendImportProgress(progressLoad);
            downloadSuccess = true;
            break;
        }
      },
      error: (error: any) => {
        console.log('Error in creating certificate Export' + JSON.stringify(error));
        downloadSuccess = false;
      },
      complete: () => {
      }
    };
    this.subscriptions.push(observable.subscribe(observer));
    return downloadSuccess;
  }

  public openFileUploadModal() {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);
  }

  public fileProgressModalHandler(event: string) {
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;
    }, 100);
  }


  exportCert(certListIds: string[]) {
    if (certListIds.length > 0) {
      this.privateCertKeyRequired(certListIds);
    }
    $('#exportCertModal').modal('show');
  }

  privateCertKeyRequired(certListIds: string[]) {
    let privateKeyFound = false;
    for (const certId of certListIds) {
      this.serverCerts.find((e: Cert) => {
        if (e.privateKeyAvailable && certId.toString() === e.id.toString()) {
          privateKeyFound = true;
          this.exportCertDescriptor.certIds.push(Number(certId));
        }
      });
    }
    this.requiredExportPrivateKey = privateKeyFound;
  }

  importCertFile() {
    this.openFileUploadModal();
    this.keyStoreDesc.entries = this.selectedCerts;
    if (this.importFile.size > 0) {
      const observable: Observable<ProgressBarDataInterface> = this.certModel.importCerts(this.importFile,
        this.keyStoreDesc);
      const observer = {
        next: (value: ProgressBarDataInterface) => {
          this.progressModalData = value;
          let shouldShowModal = false;
          const importList = value?.resultReturn;
          if (isDefined(value?.resultReturn)) {
            importList.forEach((item: Cert) => {
              const foundCert = this.localCerts.find(cert => {
                if (cert.ski === item.ski) {
                  return cert;
                }
              });
              if (isDefined(foundCert)) {
                if (item.ski === foundCert.ski && !this.overwriteCertData) {
                  shouldShowModal = true;
                  this.overrideCert = cloneDeep(item);
                } else if (item.ski === foundCert.ski && this.overwriteCertData) {
                  this.localCerts = this.localCerts.map(cert => cert.ski === item.ski ? item : cert);
                }
              } else {
                const tmpCert = item;
                tmpCert.clientId = uuidv4();
                tmpCert.id = -1;
                this.localCerts = [...this.localCerts, tmpCert];
              }
              if (shouldShowModal) {
                $('#overwriteCertModal').modal('show');
              }
              this.serverCertStatusus = cloneDeep(this.certModel.certsStatusSubject.getValue());
              this.translateCertRows(this.localCerts);
              this.cdr.detectChanges();
              this.updateDirty();
            });
          }
        },
        error: (error: any) => {
          swal('Error', 'Incorrect password. Please re-enter the password for the certificate.', error);
          this.privateKeyStorePassword = null;
          $('#passwordModal').modal('show');
        }

      };
      this.subscriptions.push(observable.subscribe(observer));
    }
  }

  overwriteCert() {
    this.overwriteCertData = true;
    this.localCerts = this.localCerts.map(cert =>
      cert.ski === this.overrideCert.ski
        ? {...this.overrideCert, id: cert.id}
        : cert
    );
    this.serverCertStatusus = cloneDeep(this.certModel.certsStatusSubject.getValue());
    this.translateCertRows(this.localCerts);
    this.cdr.detectChanges();
    this.updateDirty();
  }

  public exportFileName(event: Event) {
    const exportFiles = event.target as HTMLInputElement;
    this.exportCertDescriptor.fileName = exportFiles.value;
    this.enableExportBtn = false;
  }

  importFileName(event: Event) {
    const importFiles = event.target as HTMLInputElement;
    if (importFiles.files && importFiles.files.length > 0) {
      this.importFile = importFiles.files[0];
      this.fileName = importFiles.files[0].name;
      this.importCertType();
    }
  }

  async listImportCertFile() {
    this.openFileUploadModal();
    const observable: Observable<ProgressBarDataInterface> = this.certModel.listKeystores(this.importFile,
      this.keyStoreDesc);
    const observer = {
      next: (value: ProgressBarDataInterface) => {
        this.progressModalData = value;
        if (value?.type !== ProgressBarType.ERROR) {
          this.importCertList = cloneDeep(value?.resultReturn);
          $('#importCertModal').modal('show');
        } else {
          setTimeout(() => {
            $('.modal').modal('hide');
          }, 1000);
          alertError(value?.resultReturn?.errorDetails);
        }
      },
      error: (error: any) => {
        console.log(error);
      }
    };
    this.subscriptions.push(observable.subscribe(observer));

  }

  importCertType() {
    if (this.importFile !== null && this.importFile.name.endsWith('509')) {
      this.is509Cert = true;
      this.listImportCertFile().then();
    } else {
      this.is509Cert = false;
      $('#certPasswordModal').modal('show');
    }
  }

  viewCert() {
    this.viewCertComponent.openViewCertDialog();
  }

  verifyCert() {
    this.subscriptions.push(this.certService.verifyCertById(this.currentCert.id).subscribe(() => {
      console.log('cert verification complete');
      // this.certModel.updateCertStatusRecord()
      this.cdr.detectChanges();
    }));
  }

  verifyCertConfirmation() {
    setTimeout(() => {
      $('#verifyCert').modal('show');
    }, 0);
    this.cdr.detectChanges();
  }

  resetFileImport(fileImport?: HTMLInputElement) {
    clearFileImportInput(fileImport);
  }

  reset() {
    this.keyStoreDesc = {password: null, entries: []};
    this.privateKeyStorePassword = null;
    this.importFile = null;
    this.fileName = null;
    this.overwriteCertData = false;
    this.selectedCerts = [];
    this.disableImportBtn = true;
    this.modalSelectCert = false;
    this.currentCert = new DefaultCert();
  }

  public canDeactivate() {
    return !this.dirty;
  }

  getCertTypeString(certType: CertType): string {
    return certTypeToString[certType];
  }

  private isCertInUse(certId: number): boolean {
    let inUse = false;
    for (const transport of this.transportList) {
      if (transport.transportType === TransportType.ATSC_3) {
        const atsc3Transport = transport as ATSC3Transport;
        for (const serviceGroup of atsc3Transport.serviceGroups) {
          if (inUse) {
            break;
          }
          const currentCertChain = this.getCertIdChain(serviceGroup.currentCertId);
          const nextCertChain = this.getCertIdChain(serviceGroup.nextCertId);
          const cdtCertChain = this.getCertIdChain(serviceGroup.cdtCertId);
          const cdtNextCertChain = this.getCertIdChain(serviceGroup.cdtNextCertId);
          if (currentCertChain.has(certId) || nextCertChain.has(certId) || cdtCertChain.has(certId)
            || cdtNextCertChain.has(certId)) {
            inUse = true;
            break;
          }
        }
      }
    }
    return inUse;
  }

  private getCertIdChain(certId: number): Set<number> {
    const certIdChain = new Set<number>();
    let cert = this.getCert(certId);
    if (cert) {
      certIdChain.add(cert.id);
      let issuerId = cert.issuerId;
      while (issuerId !== -1) {
        cert = this.getCert(issuerId);
        if (cert) {
          certIdChain.add(cert.id);
          if (cert.issuerId === cert.id) {
            issuerId = -1;
          } else {
            issuerId = cert.issuerId;
          }
        } else {
          issuerId = -1;
        }
      }
    }

    return certIdChain;
  }

  private getCert(certId: number): Cert | null {
    const cert = this.serverCerts.find(c => c.id === certId) || null;
    return cert;
  }
}
