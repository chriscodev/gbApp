/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { cloneDeep, isEqual } from 'lodash';
import { ClientCertRequestModel } from 'src/app/core/models/ClientCertRequestsModel';
import { CertRequest, DefaultCertRequest,  KEY_TYPES} from 'src/app/core/models/server/Cert';
import { ActionMessage, ButtonType, ImageType } from '../../../core/models/ui/dynamicTable';
import {ModalDynamicTbTranslateComponent} from '../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';
import {Observable} from 'rxjs';
import {ProgressBarDataInterface, ProgressBarType} from '../../../core/interfaces/ProgressBarDataInterface';
import {progressLoader} from '../../../shared/helpers/progressLoadHelper';

declare var $: BootstrapFunction;
@Component({
  selector: 'app-certificate-request',
  templateUrl: './certificate-request.component.html',
  styleUrls: ['./certificate-request.component.scss'],
  providers: [],
})
export class CertificateRequestComponent  extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(ModalDynamicTbTranslateComponent) dynamicTableComponent: ModalDynamicTbTranslateComponent;
  tableHeaders = [
    { header: 'Name', key: 'name', visible: true },
    {header: 'ID', key: 'id', visible: false},
  ];
  public editMode = false;
  public keyType = Object.values(KEY_TYPES);
  public buttonList = [
    { name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: false, alwaysEnabled: true },
    { name: ButtonType.EDIT, imgSrc: ImageType.edit },
    { name: ButtonType.DELETE, imgSrc: ImageType.delete,  supportsMultiSelect: true },
    { name: ButtonType.VIEW, imgSrc: ImageType.view, supportsMultiSelect: false },
    { name: ButtonType.EXPORT, imgSrc: ImageType.export, supportsMultiSelect: false }
  ];
  title  = '';
  fileName: string;
  public okButtonEnabled: boolean;
  serverCertData: CertRequest[] = [];
  localCertData: CertRequest[] = [];
  currentCertReq: CertRequest = new DefaultCertRequest();
  currentType = 'CertRequest';
  modalName = '#addEditCertificateModal';
  public nameIconText: string;
  public organizationIconText: string;
  public stateIconText: string;
  public countryIconText: string;
  public cityIconText: string;
  public commonNameIconText: string;
  private nameValid: boolean;
  private organizationValid: boolean;
  private stateValid: boolean;
  private countryValid: boolean;
  private cityValid: boolean;
  private commonNameValid: boolean;
  public showPassword: boolean;
  public csrId: number;
  public passKey = '';
  exportData: string;

  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  constructor(private certRequestModel: ClientCertRequestModel, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.editMode = false;
    this.subscriptions?.push(this.certRequestModel.certRequestList$.subscribe(() => {
        this.loadCertData();
    }));
    this.cdr.detectChanges();
  }

  loadCertData() {
      this.serverCertData = cloneDeep(this.certRequestModel.certRequestSubject.getValue());
      this.localCertData = cloneDeep(this.certRequestModel.certRequestSubject.getValue());
  }

  onButtonClicked($event: any) {
    switch ($event.message) {
      case ActionMessage.EDIT: {
        this.editMode = true;
        this.currentCertReq = cloneDeep(this.dynamicTableComponent.selectedRow);
        this.title = 'Edit Certificate Request - ' + this.currentCertReq.name;
        this.modalName = '#addEditCertificateModal';
        this.validateCertRequest();
        this.updateDirty();
        break;
      }
      case ActionMessage.DELETE: {
        this.editMode = false;
        this.deleteCertificate();
        this.updateDirty();
        break;
      }
      case ActionMessage.VIEW: {
        this.currentCertReq = cloneDeep(this.dynamicTableComponent.selectedRow);
        this.modalName = '#viewCertificateModal';
        this.viewCertificate();
        break;
      }
      case ActionMessage.ADD: {
        this.editMode = false;
        this.title = 'Add Certificate Request';
        this.currentCertReq = new DefaultCertRequest();
        break;
      }
      case ActionMessage.EXPORT: {
        this.csrId =  cloneDeep(this.dynamicTableComponent.selectedRow).id;
        this.exportCert();
        break;
      }
    }
  }
  exportCert(){
    $('#exportCertModal').modal('show');
  }
  viewCertificate() {
    $('#viewCertificateModal').modal('show');
  }

  addCertRequest() {
    if (this.dynamicTableComponent.selectedRow !== null && this.editMode) {
      Object.assign(this.dynamicTableComponent.selectedRow, this.currentCertReq);
    } else {
      this.localCertData = [...this.localCertData, this.currentCertReq];
    }
    this.validateCertRequest();
    this.closeModal('#addEditCertificateModal');
    this.updateDirty();
  }
  deleteCertificate(){
    if (this.dynamicTableComponent.selectedRowIds.length > 0){
      for (let i = 0; i < this.dynamicTableComponent.selectedRowIds.length; i++) {
        const selectID = this.dynamicTableComponent?.selectedRowIds[i];
        this.localCertData = this.localCertData.filter((cert) => {
          const idMatch = cert.id.toString() !== selectID.toString();
          const clientIdMatch = cert.clientId !== selectID.toString();
          return idMatch && clientIdMatch;
        });
      }
    } else {
      this.localCertData = this.localCertData.filter(
        cert => cert.clientId !== this.dynamicTableComponent.selectedRow.clientId);
    }
  }

  public updateDirty() {
    this.dirty = !isEqual(this.localCertData, this.serverCertData);
  }
  copyClipBoard(copyData: string) {
    navigator.clipboard.writeText(copyData).then();
  }

  downloadFile(filename: string, text: string) {
    this.progressModalData = progressLoader(100, 100, filename, ProgressBarType.DOWNLOAD);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  download(downloadData: any, fileName: string) {
    this.openFileUploadModal();
    const text = downloadData;
    const filename = 'CertificateRequest_' + fileName + '.csr';
    this.downloadFile(filename, text);
  }
  onCommit() {
    this.certRequestModel.update(this.localCertData);
    this.dirty = false;
  }
  onRevert() {
    this.dirty = false;
    this.loadCertData();
  }
  ngOnDestroy(): void {
   this.cleanUpSubscriptions();
  }
  private updateOkEnabled(): void {
    this.okButtonEnabled = this.nameValid && this.cityValid && this.stateValid &&
       this.countryValid && this.commonNameValid && this.organizationValid;
  }
  private updateNameValid(): void {
    this.nameValid = this.currentCertReq.name?.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }
  private updateCountryValid(): void {
    this.countryValid = this.currentCertReq.country?.length > 0;
    this.countryIconText = this.countryValid ? 'text-success' : 'text-danger';
  }
  private updateCityValid(): void {
    this.cityValid = this.currentCertReq.locality?.length > 0;
    this.cityIconText = this.cityValid ? 'text-success' : 'text-danger';
  }
  private updateStateValid(): void {
    this.stateValid = this.currentCertReq.state?.length > 0;
    this.stateIconText = this.stateValid ? 'text-success' : 'text-danger';
  }
  private updateOrganizationValid(): void {
    this.organizationValid = this.currentCertReq.organization?.length > 0;
    this.organizationIconText = this.organizationValid ? 'text-success' : 'text-danger';
  }
  private updateCommonNameValid(): void {
    this.commonNameValid = this.currentCertReq.commonName?.length > 0;
    this.commonNameIconText = this.commonNameValid ? 'text-success' : 'text-danger';
  }

  public closeModal(modalName: string) {
    $(modalName).modal('hide');
    if ( modalName.includes('exportCertDownloadModal')){
      $('#exportCertModal').modal('hide');
    }
  }
  public validateCertRequest(): void {
    this.updateNameValid();
    this.updateCityValid();
    this.updateOrganizationValid();
    this.updateCommonNameValid();
    this.updateStateValid();
    this.updateCountryValid();
    this.updateOkEnabled();
  }

   exportCertFile(){
     const observable: Observable<string> = this.certRequestModel.doExport(this.csrId, this.passKey);
     const observer = {
       next: (exportData: any) => {
         this.openExportData(exportData);
       },
       error: (error: any) => {
         console.log('Error in creating certificate request Export' + JSON.stringify(error));
       },
       complete: () => { }
     };
     this.subscriptions.push(observable.subscribe(observer));
  }
  openExportData(exportData: string){
    this.exportData = exportData;
    $('#exportCertDownloadModal').modal('show');
  }
  public rowClicked(row: any){
    const tmpCert = !row?.hasOwnProperty('clientId');
    if (!tmpCert && row?.id === -1){
      this.dynamicTableComponent.disableButtons([ButtonType.VIEW, ButtonType.VERIFY]);
    }
  }

  public canDeactivate() {
    return !this.dirty;
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

}
