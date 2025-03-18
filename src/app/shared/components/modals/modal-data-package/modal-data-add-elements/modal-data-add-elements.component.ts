/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, ViewChild} from '@angular/core';
import {ActionMessage, ButtonType, ImageType} from '../../../../../core/models/ui/dynamicTable';
import {DataElement} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/DataElement';
import {DefaultCustomAWSAttributes, DefaultFTPAttributes, DefaultHttpGetAttributes, DefaultHttpPutAttributes, DefaultWebDAVAttributes, INGEST_PROTOCOLS, IngestAttributes, IngestProtocol, PAYLOAD_FORMATS} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/Ingest';
import {cloneDeep, isEqual} from 'lodash';
import {AbstractCommitRevertComponent} from '../../../../../pages/main/abstracts/abstract-commit-revert.component';
import {ClientModelListener} from '../../../../../core/models/ClientModelListener';
import {DataPackage, DeliveryMode, PackageType} from '../../../../../core/models/dtv/network/physical/stream/ip/data/DataPackage';
import {AppAttributes, DefaultAppAttributes} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/App';
import {DefaultTransmitAttributes, FECAttributes, FECMode, TransmitAttributes, TransmitPriority} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/Transmit';
import {DefaultSigningAttributes, SIGNING_TYPES, SigningAttributes} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/Singing';
import {AWS_REGIONS} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/AWSRegion';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {MatTabGroup} from '@angular/material/tabs';
import {v4 as uuidv4} from 'uuid';
import {date1BeforeDate2} from '../../../../helpers/dateTimeUtil';
import {DatePipe} from '@angular/common';
import {ModalFileUploadComponent} from '../modal-file-upload/modal-file-upload.component';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';


declare var $;
@Component({
  selector: 'app-modal-data-add-elements',
  templateUrl: './modal-data-add-elements.component.html',
  styleUrls: ['./modal-data-add-elements.component.scss']
})
export class ModalDataAddElementsComponent extends  AbstractCommitRevertComponent implements OnInit, OnChanges, OnDestroy, ClientModelListener {
  @ViewChild(ModalDynamicTbTranslateComponent) dataElementTableComponent: ModalDynamicTbTranslateComponent;
  @ViewChild(ModalFileUploadComponent, { static: false }) fileUploadComponent: ModalFileUploadComponent;
  @Output() dataPackageElementsChanged: EventEmitter<any> = new EventEmitter();
  @Input() currentDataPackage: DataPackage;
  @Input() localDataElements: DataElement[];
  @ViewChild('dataElementTab') dataElementTab: MatTabGroup;
  public title = 'Add Data Element ';
  public type: string;
  public editMode: boolean;
  public disableActionButton: boolean;
  addElementEmit: any;
  dataDataElementObject: any = {};
  serverDataElements: DataElement[] = [];
  currentDataElement: DataElement;
  currentIngestAttributes: IngestAttributes ;
  appAttributes: AppAttributes ;
  transmitAttributes: TransmitAttributes;
  fecAttributes: FECAttributes;
  signingAttributes: SigningAttributes;
  dataTabIndex: number;
  transmitSummary = 'Transmit at LOW Priority, continuously, using any leftover bandwidth, starting immediately.';
  dataId = 'dataElement';
  sliderOptions = {
    floor: 0, ceil: 100, step: 1
  };

  public tableElementHeaders = [
    {header: 'Name', key: 'name', visible: true, subclass: false},
    {header: 'Ingest Protocol', key: 'ingestAttributes.ingestProtocol', visible: true, subclass: true},
    {header: 'Ingest Status', key: 'id', visible: true, subclass: false }
  ];
  public buttonList = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, disable: false},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: false},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, disable: false}
  ];
  modalName = '#dataElementModal';
  ingestProtocols = Object.values(INGEST_PROTOCOLS);
  payloadFormats = Object.values(PAYLOAD_FORMATS);
  transmitPriority = Object.values(TransmitPriority);
  awsRegions = Object.values(AWS_REGIONS);
  fecModes = Object.values(FECMode);
  signing = Object.values(SIGNING_TYPES);

  constructor() {
    super();
    this.createDefaultDataElement();
    this.dataTabIndex = 0;
  }

  ngOnInit(): void {
    this.editMode = false;
    this.createDefaultDataElement();
    this.dataTabIndex = 0;
    this.localDataElements = this.currentDataPackage.dataElements;
  }
  public updateDataPackageElements() {
    this.dataPackageElementsChanged.emit();
  }
  onChangeIngestProtocolType() {
    const ingestProtocol: string = this.currentDataElement.ingestAttributes.ingestProtocol;
    if (ingestProtocol === IngestProtocol.HTTP_GET) {
      this.currentDataElement.ingestAttributes = new DefaultHttpGetAttributes();
    } else if (ingestProtocol === IngestProtocol.HTTP_PUT) {
      this.currentDataElement.ingestAttributes = new DefaultHttpPutAttributes();
    } else if (ingestProtocol === IngestProtocol.WEBDAV) {
      this.currentDataElement.ingestAttributes = new DefaultWebDAVAttributes();
    } else if (ingestProtocol === IngestProtocol.SIG_AWS_S3) {
      this.currentDataElement.ingestAttributes = new DefaultCustomAWSAttributes();
    }
    this.currentDataElement.ingestAttributes.ingestProtocol = ingestProtocol as IngestProtocol;
  }

  onChangeFecMode(index: number, $event ) {
    const fecMode: string = $event.target.value;
    if (fecMode !== null){
      this.fecAttributes = new FECAttributes(fecMode as FECMode, null, 0, 0, 0);
    }
    this.currentDataElement.transmitAttributes.fecAttributes = this.fecAttributes;
  }

  /***
   *  Add or Update Data Element
   */
  public addUpdateCurrentDataElement() {
    if (this.dataElementTableComponent.selectedRow !== null) {
      Object.assign(this.dataElementTableComponent.selectedRow, this.currentDataElement);
      this.updateCurrentDataElement();
    } else {
      this.currentDataElement.clientId = uuidv4();
      if (this.localDataElements === null ){
        this.localDataElements = [];
      }
      this.localDataElements = [...this.localDataElements, this.currentDataElement];
    }
    this.closeModal();
    this.currentDataPackage.dataElements = this.localDataElements;
    this.updateDataElements();
    this.updateDirty();
  }

  private updateCurrentDataElement() {
    const index = this.localDataElements.findIndex(
      (dataElement) => this.currentDataElement?.id > 0 ? dataElement.id === this.currentDataElement.id :
        dataElement.clientId === this.currentDataElement.clientId);
    if (index !== -1) {
      this.localDataElements = [...this.localDataElements.slice(0, index), this.currentDataElement, ...this.localDataElements.slice(
        index + 1)];
    }
  }
  public onButtonClicked($event: any) {
    if (this.dataElementTableComponent.selectedRow !== null) {
      if ($event.message === ActionMessage.EDIT) {
        // do not remove below 2 initialization for currentDataElement else it wont create ingest Attribute from server values
        this.currentDataElement = cloneDeep(this.dataElementTableComponent.selectedRow);
      //  this.currentDataElement = this.createDefaultIngestAttribute(cloneDeep(this.currentDataElement).currentDataElement);
        this.title = 'Edit Data Element - ' + this.currentDataElement.name;
        this.disableActionButton = true;
      } else if ($event.message === ActionMessage.DELETE) {
        if (this.dataElementTableComponent.selectedRow?.id > 0) {
          this.localDataElements = this.localDataElements.filter(dataElement => dataElement.id !== this.dataElementTableComponent.selectedRow.id);
        } else {
          this.localDataElements = this.localDataElements.filter(
            dataElement => dataElement.clientId !== this.dataElementTableComponent.selectedRow.clientId);
        }
        this.updateDirty();
      }
    }else {
      this.editMode = false;
      this.disableActionButton = true;
      this.createDefaultDataElement();
      if (this.currentDataElement.ingestAttributes !== null) {
        this.createDefaultIngestAttribute(this.currentDataElement);
      }
      if (this.localDataElements === null){
        this.localDataElements = [];
      }
      this.title = 'Add Data Element ';
    }
    this.currentDataPackage.dataElements = this.localDataElements;
    this.updateOkButtonEnabled();
  }
  /***
   *  create default DataElement
   *  */
  public createDefaultDataElement(){
    this.appAttributes = new DefaultAppAttributes();
    this.currentIngestAttributes = new DefaultFTPAttributes();
    this.transmitAttributes = new DefaultTransmitAttributes();
    this.signingAttributes = new DefaultSigningAttributes();
    this.currentDataElement = new DataElement('', this.currentIngestAttributes, this.transmitAttributes, this.appAttributes, this.signingAttributes, 0, undefined);
  }
  createDefaultIngestAttribute(dataElement: DataElement ): DataElement{
    const ingestProtocol: string = dataElement.ingestAttributes.ingestProtocol;
    if (ingestProtocol === IngestProtocol.HTTP_GET) {
      this.currentDataElement.ingestAttributes = new DefaultHttpGetAttributes();
    } else if (ingestProtocol === IngestProtocol.HTTP_PUT) {
      this.currentDataElement.ingestAttributes = new DefaultHttpPutAttributes();
    } else if (ingestProtocol === IngestProtocol.WEBDAV) {
      this.currentDataElement.ingestAttributes = new DefaultWebDAVAttributes();
    } else if (ingestProtocol === IngestProtocol.SIG_AWS_S3) {
      this.currentDataElement.ingestAttributes = new DefaultCustomAWSAttributes();
    }
    console.log('------' + JSON.stringify(this.currentDataElement));
    return this.currentDataElement;
  }
  ngOnDestroy(): void {
  }

  public onRevert() {
    // this.loadServerDataPackages();
  }

  public onCommit() {
    console.log('DataPackageComponent onCommit...');
    // this.dataPackageModel.update(this.localDataElements).then(() => this.dirty = false);
  }
  public updateDirty() {
    this.dirty = !isEqual(this.localDataElements, this.serverDataElements);
  }
  public notifyModelUpdated(): void {
    // console.log('DataPackageComponent notifyModelUpdated');
    if (this.dirty) {
      // TODO Display warning message to dataElement explaining remote client did a commit and local changes are going to be lost
    }
 //   this.loadServerDataPackages();
  }

  // update Transmit Summary info
  public getSummary() {
     if (this.currentDataPackage.broadcastAttributes.elementSchedulingMode === 'INTERVAL') {
      this.transmitSummary = 'Transmit at ' + this.currentDataElement.transmitAttributes.transmitPriority + ' Priority, continuously, using any leftover bandwidth, starting immediately.';
     }else{
       this.transmitSummary = 'Transmit at LOW Priority, continuously, using any leftover bandwidth, starting immediately.';
    }
  }
  getIngressURL(): string {
    let path = '';
    if (this.currentDataElement.ingestAttributes.ingestProtocol === IngestProtocol.HTTP_PUT
      || this.currentDataElement.ingestAttributes.ingestProtocol === IngestProtocol.WEBDAV ) {
      if (this.currentDataElement.ingestAttributes.path !== null) {
        path = this.currentDataElement.ingestAttributes.path;
      } else {
        path = 'URL available after commit';
      }
    }else if (this.currentDataElement.ingestAttributes.ingestProtocol === IngestProtocol.FILE_UPLOAD ){
      path = 'upload unavailable until first element commit';
    }
    return path;
  }
  convertDateTime($event): string{
    const datepipe: DatePipe = new DatePipe('en-US');
    console.log('test' + JSON.stringify(this.currentDataElement.ingestAttributes.region));
    return datepipe.transform($event.target.value,  'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
  }
  validateDates(date1, date2): boolean{
    return date1BeforeDate2(date1, date2);
  }
  updateDataElements(){
    this.dataPackageElementsChanged.emit(this.localDataElements);
  }
  closeModal(){
     $('#dataElementModal').modal('hide');
  }

  isValidURL(): boolean {
    if (this.currentDataElement.ingestAttributes.ingestProtocol === 'HTTP_GET') {
      return new RegExp('^https?:\\/\\/[^\\s$.?#].[^\\s]*$').test(this.currentDataElement.ingestAttributes.url);
    } else if (this.currentDataElement.ingestAttributes.ingestProtocol === 'AWS_S3' || this.currentDataElement.ingestAttributes.ingestProtocol === 'SIG_AWS_S3') {
      return new RegExp('^s3?:\\/\\/[^\\s$.?#].[^\\s]*$').test(this.currentDataElement.ingestAttributes.url);
    } else {
      return false;
    }
  }

  validateIngestAttributes(): boolean {
    let ingestValid = false;
    if (this.currentDataElement.ingestAttributes.ingestProtocol === 'FILE_UPLOAD') {
      ingestValid = true;
    } else if (this.currentDataElement.ingestAttributes.ingestProtocol === 'HTTP_GET') {
      ingestValid = (this.currentDataElement.ingestAttributes.url !== null && this.currentDataElement.ingestAttributes.url.length > 0);
    } else if (this.currentDataElement.ingestAttributes.ingestProtocol === 'HTTP_PUT') {
      ingestValid = true;
    } else if (this.currentDataElement.ingestAttributes.ingestProtocol === 'WEBDAV') {
      ingestValid = this.currentDataElement.ingestAttributes.username !== null && this.currentDataElement.ingestAttributes.password !== null;
    } else if (this.currentDataElement.ingestAttributes.ingestProtocol === 'AWS_S3') {
      ingestValid = this.currentDataElement.ingestAttributes.accessKeyId !== null && this.currentDataElement.ingestAttributes.accessKeyValue !== null
        && this.currentDataElement.ingestAttributes.url !== null && this.currentDataElement.ingestAttributes.region !== null;
    } else if (this.currentDataElement.ingestAttributes.ingestProtocol === 'SIG_AWS_S3') {
      ingestValid = this.currentDataElement.ingestAttributes.apiKeyId !== null && this.currentDataElement.ingestAttributes.apiKeyValue !== null
        && this.currentDataElement.ingestAttributes.accessKeyId !== null && this.currentDataElement.ingestAttributes.accessKeyValue !== null
        && this.currentDataElement.ingestAttributes.url !== null && this.currentDataElement.ingestAttributes.region !== null;
    }
    return ingestValid;
  }

  updateHeld($event){
    if ($event.target.checked){
      this.currentDataElement.appAttributes.b64XmlHeld = 'true';
    }else{
      this.currentDataElement.appAttributes.b64XmlHeld = 'false';
    }
    this.updateOkButtonEnabled();
  }
  validateAppAttributes(): boolean{
      let appAttrValid = false;
      if (this.currentDataPackage.packageType === PackageType.USER_DEFINED_NDP){
        appAttrValid = true;
      }else {
        if (this.currentDataElement.appAttributes.b64XmlHeld === 'true') {
          if (this.currentDataPackage.deliveryMode === DeliveryMode.BROADBAND) {
              appAttrValid = this.currentDataElement.appAttributes.appContextIdList !== null &&
              this.currentDataElement.appAttributes.bbandEntryPageUrl !== null;
          } else if (this.currentDataPackage.deliveryMode === DeliveryMode.BROADCAST) {
              appAttrValid = this.currentDataElement.appAttributes.appContextIdList !== null &&
              this.currentDataElement.appAttributes.bcastEntryPageUrl !== null;
          }
          if (this.currentDataElement.appAttributes.validUntilTime !== null
            && this.currentDataElement.appAttributes.validFromTime !== null){
            appAttrValid = this.validateDates(this.currentDataElement.appAttributes.validFromTime, this.currentDataElement.appAttributes.validUntilTime);
          }
          if (this.currentDataElement.appAttributes.clearAppContextCacheTime !== null
            && this.currentDataElement.appAttributes.validUntilTime !== null){
            appAttrValid = this.validateDates(this.currentDataElement.appAttributes.validUntilTime, this.currentDataElement.appAttributes.clearAppContextCacheTime);
          }
        }else{
            appAttrValid = this.currentDataElement.appAttributes.appContextIdList !== null;
        }
      }
      console.log('App Attributes Valid:' + appAttrValid);
      return appAttrValid;
  }

  validateTransmitAttributes(): boolean {
    let transmitValid = true;
    if (this.currentDataElement.transmitAttributes.startTime !== null && this.currentDataElement.transmitAttributes.endTime !== null){
      transmitValid = this.validateDates(this.currentDataElement.transmitAttributes.startTime, this.currentDataElement.transmitAttributes.endTime);
    }
    console.log('Transmit Attributes Valid:' + transmitValid);
    return transmitValid;
  }
  public updateOkButtonEnabled(): boolean{
    const elementAttributesValid = this.validateIngestAttributes()
       && this.validateAppAttributes() && this.validateTransmitAttributes();
    return (isDefined(this.currentDataElement.name) && this.currentDataElement.name.length > 0)
      && elementAttributesValid;
  }
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    this.createDefaultDataElement();
    this.dataTabIndex = 0;
    this.localDataElements = this.currentDataPackage.dataElements;
  }
  /**
   * upload File to server for FILE_UPLOAD
   */
  uploadFile() {
    setTimeout(() => {
      $('#fileUploadModal').modal({keyboard: true,
        show: true
      });
    }, 0);
  }
}
