/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash';
import {isIPAddressValid, validateIPAddressKeyEvent} from 'src/app/shared/helpers';
import {isDefined, isUndefined} from '../../../../../core/models/dtv/utils/Utils';
import {Subscription} from 'rxjs';
import {
  DefaultMediaStream,
  EncodingType,
  IngestProtocol,
  MediaStream,
  ServiceConfiguration
} from '../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {AbstractCommitRevertComponent} from '../../../abstracts/abstract-commit-revert.component';
import {ClientModelListener} from '../../../../../core/models/ClientModelListener';
import {ClientMediaStreamsModel} from '../../../../../core/models/ClientMediaStreamsModel';
import {ActionMessage, ButtonType, ImageType, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';

import {ClientNetworkSettingsModel} from '../../../../../core/models/ClientNetworkSettingsModel';
import {NICInterface} from '../../../../../core/models/server/NetworkSetting';
import {v4 as uuidv4} from 'uuid';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {deleteElementList} from '../../../../../core/models/AbstractElement';

@Component({
  selector: 'app-media-stream',
  templateUrl: './mediastream.component.html',
  styleUrls: ['./mediastream.component.scss'],
})
export class MediaStreamComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ClientModelListener {
  @Output() mediaStreamsChanged: EventEmitter<any> = new EventEmitter();
  @ViewChild(ModalDynamicTbTranslateComponent) mediaTableComponent: ModalDynamicTbTranslateComponent;
  @Input() serverMediaStreams: MediaStream[] = [];
  public type: string;
  public editMode: boolean;
  public buttonList = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, disable: false, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: false, supportsMultiSelect: false},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, disable: false, supportsMultiSelect: true},
    {name: ButtonType.UPDATEROW, imgSrc: ImageType.disable, disable: false, supportsMultiSelect: true},
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Ingest Protocol', key: 'ingestProtocol', visible: true},
    {header: 'Enabled', key: 'enabled', visible: true}
  ];
  public title = 'Add MediaStream';
  public okButtonEnabled = false;
  public ingestProtocols = Object.values(IngestProtocol);

  public SLTConfig = Object.values(ServiceConfiguration);
  public iconText: string;
  public icon: any;
  localMediaStreams: MediaStream[] = [];
  modalName = '#mediaStreamModal';
  ipPattern = '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
  netInterface: NICInterface[] = [];
  sltConfiguration: any;
  encodingType = true;
  currentMediaStream: MediaStream = new DefaultMediaStream();
  // TODO
  public subscriptions: Subscription[] = [];

  constructor(
    private mediaStreamModel: ClientMediaStreamsModel,
    private clientNetworkSettingsModel: ClientNetworkSettingsModel,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.getNetworkSettings();
    this.editMode = false;
    this.loadServerMediaStreams();
  }

  public onRevert() {
    this.loadServerMediaStreams();
  }

  public onCommit() {
    console.log('MediaStreamComponent onCommit...');
    // use the commit only incase of enabled disable stream or use the bulk commit check with Dave
    // this.mediaStreamModel.update(this.localMediaStreams).then(() => this.dirty = false);
  }

  public updateDirty() {
    this.dirty = !isEqual(this.localMediaStreams, this.serverMediaStreams);
    if (this.dirty) {
      const message = ActionMessage.DIRTY;
      const updatedData = this.localMediaStreams;
      const data = {message, updatedData};
      this.mediaStreamsChanged.emit(data);
    }
  }

  public notifyModelUpdated(): void {
    console.log('MediaStreamComponent notifyModelUpdated');
    if (this.dirty) {
      // TODO Display warning message to user explaining remote client did a commit and local changes are going to be lost
    }
    this.loadServerMediaStreams();
  }

  /***
   *  Add or Update a MediaStream
   */
  public addUpdateCurrentMediaStream() {
    if (this.mediaTableComponent.selectedRow !== null) {
      this.updateCurrentMediaStream();
    } else {
      this.currentMediaStream.clientId = uuidv4();
      this.localMediaStreams = [...this.localMediaStreams, this.currentMediaStream];
    }
    this.updateDirty();
    this.currentMediaStream = new DefaultMediaStream();
  }

  public onButtonClicked($event: any) {
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRows();
        break;
      case ActionMessage.ENABLE_DISABLE:
        this.onEnableDisable();
        break;
    }
    this.updateOkButtonEnabled();
    this.cdr.detectChanges();
  }

  private onDeleteRows(): void {
    this.multipleDeletion();
    this.updateDirty();
  }

  private multipleDeletion() {
    this.localMediaStreams = deleteElementList(this.localMediaStreams, this.mediaTableComponent) as MediaStream[];
  }


  private onEnableDisable() {
    if (this.mediaTableComponent.selectedRowIds.length > 0) {
      this.onUpdateAllRows();
      this.setButtonOnlineStatus();
    }
    this.updateDirty();
  }


  private onUpdateAllRows() {
    const localCopy = this.mediaTableComponent.disableEnableRows('enabled');
    this.localMediaStreams = [...localCopy];
    this.cdr.detectChanges();
  }

  private setButtonOnlineStatus() {
    if (isDefined(this.mediaTableComponent)) {
      if (this.mediaTableComponent?.selectedRow?.enabled) {
        this.mediaTableComponent.buttonImage = ImageType.disable;
        this.mediaTableComponent.buttonText = ButtonType.DISABLE;
      } else {
        this.mediaTableComponent.buttonImage = ImageType.enable;
        this.mediaTableComponent.buttonText = ButtonType.ENABLE;
      }
    }
  }

  private onAddRow(): void {
    this.editMode = false;
    this.currentMediaStream = new MediaStream(null, 0, false, null,
      IngestProtocol.HTTP_GET, '', '', '', '', 0, '', 0, 0,
      null, '', ServiceConfiguration.Broadcast, '', 0, '');
    this.title = 'Add Media Stream ';
  }

  private onEditRow(): void {
    this.editMode = true;
    this.currentMediaStream = cloneDeep(this.mediaTableComponent.selectedRow);
    this.title = 'Edit Media Stream - ' + this.currentMediaStream.name;
  }

  private loadServerMediaStreams() {
    this.updateMediaStreams(this.mediaStreamModel.getMediaStreams());
  }

  /**
   * update the local and server object along with dynamic table object from the data from server
   */
  private updateMediaStreams(mediaStreams: MediaStream[]) {
    console.log('MediaStreamComponent mediaStreams: ', mediaStreams);
    this.serverMediaStreams = cloneDeep(mediaStreams);
    this.localMediaStreams = cloneDeep(this.serverMediaStreams);
    this.dirty = false;
  }

  private updateCurrentMediaStream() {
    const index = this.localMediaStreams.findIndex(
      (mediaStream) => this.currentMediaStream?.id > 0 ? mediaStream.id === this.currentMediaStream.id :
        mediaStream.clientId === this.currentMediaStream.clientId);
    if (index !== -1) {
      this.localMediaStreams = [...this.localMediaStreams.slice(0, index), this.currentMediaStream, ...this.localMediaStreams.slice(
        index + 1)];
    }
  }

  /**
   * loads network Interface Name
   */
  getNetworkSettings() {
    // this.netInterface = cloneDeep(this.clientNetworkSettingsModel.getNetworkList());
  }

  onEncodeTypeChangeHandler(index: number, $event) {
    const encodingType: string = $event.target.value;
    this.currentMediaStream.encodingType = encodingType as EncodingType;
  }

  ipAddressOnly(event) {
    return validateIPAddressKeyEvent(event);
  }

  ngOnDestroy(): void {
    // TODO add stomp subcription
    // this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onChangeIngestProtocolType(index: number, $event) {
    const ingestProtocol: string = $event.target.value;
    this.currentMediaStream.ingestProtocol = ingestProtocol as IngestProtocol;
  }

  /**
   * Returns true if the field value is a valid URL. A valid URL has a "http://" in front,
   * and at least some server of the form "x.y"
   */
  isValidURL(): boolean {
    const urlString: string = this.currentMediaStream.ingestUrl;
    if (isUndefined(urlString)) {
      return false;
    }
    return new RegExp('^https?:\\/\\/[^\\s$.?#].[^\\s]*$').test(urlString);
  }

  public validIpAddress(ipAddress: string) {
    return isIPAddressValid(ipAddress);
  }

  public updateOkButtonEnabled(): boolean {
    let protocolFieldsValid = false;
    switch (this.currentMediaStream.ingestProtocol) {
      case IngestProtocol.HTTP_GET:
        protocolFieldsValid = this.isValidURL();
        break;
      case IngestProtocol.HTTP_PUT:
        protocolFieldsValid = isDefined(this.currentMediaStream.ingestPath) && this.currentMediaStream.ingestPath.length > 0;
        break;
      case IngestProtocol.WEBDAV:
        protocolFieldsValid = isDefined(this.currentMediaStream.username) && isDefined(this.currentMediaStream.password);
        break;
    }
    this.okButtonEnabled = (isDefined(this.currentMediaStream.name) && this.currentMediaStream.name.length > 0)
      && (isDefined(this.currentMediaStream.dstAddress) ? isIPAddressValid(this.currentMediaStream.dstAddress) : false)
      && (isDefined(this.currentMediaStream.dstPort))
      && (isDefined(this.currentMediaStream.ttl)) && protocolFieldsValid;
    return this.okButtonEnabled;
  }

  public getIngressURL(): string {
    const host: string = window.location.hostname;
    let path = '';
    if (this.currentMediaStream.ingestProtocol === IngestProtocol.HTTP_PUT) {
      path = `/re/put/` + this.currentMediaStream.ingestPath;
    } else if (this.currentMediaStream.ingestProtocol === IngestProtocol.WEBDAV) {
      path = `/re/webdav/` + this.currentMediaStream.ingestPath;
    }
    if (this.currentMediaStream.id === 0) {
      return 'URL available after commit';
    } else {
      return host + path;
    }
  }

  public ipValidator(ipaddress: string): boolean {
    const ipPattern = /^((([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.){3}([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]))$/;
    return !ipPattern.test(ipaddress);
  }

}
