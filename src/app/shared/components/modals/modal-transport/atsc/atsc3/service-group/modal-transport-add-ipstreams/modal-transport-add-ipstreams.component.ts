// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.
import {cloneDeep} from 'lodash';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {isIPAddressValid, validateIP} from 'src/app/shared/helpers';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../../../../core/models/ui/dynamicTable';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {
  ATSC3Stream,
  DefaultATSC3Stream,
  IPStreamType
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/IPStream';
import {
  EncodingType,
  MediaStream
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';
import {ClientMediaStreamsModel} from '../../../../../../../../core/models/ClientMediaStreamsModel';
import {UNINITIALIZED_ID, updateElementList} from '../../../../../../../../core/models/AbstractElement';
import {v4 as uuidv4} from 'uuid';
import {Subscription} from 'rxjs';
import {ServiceGroupComponent} from '../service-group.component';
import {DtvNetworkComponent} from '../../../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {
  AbstractTransport,
  ATSC3Transport,
  TransportType
} from '../../../../../../../../core/models/dtv/network/physical/Transport';

declare var $;

@Component({
  selector: 'app-modal-transport-add-ipstreams',
  templateUrl: './modal-transport-add-ipstreams.component.html',
  styleUrls: ['./modal-transport-add-ipstreams.component.scss']
})
export class ModalTransportAddIPStreamsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ipStreams: ATSC3Stream[];
  @Input() atsc3TransportStream: AbstractTransport;
  @Output() ipStreamsChanged: EventEmitter<ATSC3Stream[]> = new EventEmitter<ATSC3Stream[]>();
  @ViewChild(ModalDynamicTbTranslateComponent) ipStreamsDynamicTable: ModalDynamicTbTranslateComponent;
  public readonly numberOnly = numberOnly;
  public readonly validateIP = validateIP;
  public readonly ipStreamTypes = Object.values(IPStreamType);
  public localIPStream: ATSC3Stream = new DefaultATSC3Stream();
  public localIPStreams: ATSC3Stream[] = [];
  public modalTitle: string;
  public objectTitle = 'IPStream';
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.ADDIP, imgSrc: ImageType.add, alwaysEnabled: true}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Service ID', key: 'serviceId', visible: true},
    {header: 'Type', key: 'type', visible: true},
    {header: 'External', key: 'external', visible: true},
    {header: 'Address', key: 'destinationIP', visible: true},
    {header: 'Port', key: 'destinationPort', visible: true}
  ];
  public selectableMediaStreams: MediaStream[] = [];
  public nameIconText: string;
  public destinationAddressIconText: string;
  public destinationPortIconText: string;
  public serviceIdIconText: string;
  public sourceAddressIconText: string;
  public okButtonEnabled = false;
  private editMode = false;
  private nameValid: boolean;
  private destinationAddressValid: boolean;
  private destinationPortValid: boolean;
  private serviceIdValid: boolean;
  private sourceAddressValid: boolean;
  private subscriptions: Subscription [] = [];


  public usedIds: number[];
  public getStreamIDs: number[];
  public deletedData: any[] = [];

  constructor(
    @Optional() @Inject(ServiceGroupComponent) private serviceGroups: ServiceGroupComponent,
    @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent,
    private clientMediaStreamsModel: ClientMediaStreamsModel,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.clientMediaStreamsModel.mediaStreams$.subscribe(
      (mediaStreams: MediaStream[]) => {
        console.log('ModalTransportAddIPStreamsComponent clientMediaStreamsModel mediaStreams: ', mediaStreams);
        this.updateSelectableMediaStreams();
        this.validateIPStreamLinks();
      }));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log('ModalTransportAddIPStreamsComponent changes: ', changes);

    if (isDefined(changes.ipStreams?.currentValue)) {
      this.localIPStreams = changes.ipStreams.currentValue;
      this.localIPStreams = this.resolveATSC3IPStreams(this.localIPStreams);
      this.updateSelectableMediaStreams();
      this.validateIPStreamLinks();
    }
    this.updateIPStreamValid();
  }

  public ngOnDestroy(): void {
    console.log('ngOnDestroy ModalTransportAddIPStreamsComponent');
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public mediaStreamsSelected(mediaStreams: MediaStream[]): void {
    this.addMediaStream(mediaStreams);
    this.ipStreamsChanged.emit(this.localIPStreams);
  }

  public inputIPStream(): void {
    this.updateIPStreamValid();
  }

  public closeModal() {
    $('#modalTransportAddExternalIPStream').modal('hide');
  }

  public addExternalIPStream() {
    this.closeModal();
    this.addUpdateCurrentIPStream();
    this.ipStreamsChanged.emit(this.localIPStreams);
  }

  public onButtonClicked($event: any) {
    this.deletedData = [];
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddMediaIPStream();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRow();
        break;
      case ActionMessage.ADDIP:
        this.onAddExternalIPStream();
        break;
    }
  }

  public onRowClicked(atsc3Stream: ATSC3Stream): void {
    if (atsc3Stream?.linkedStreamId > 0) {
      this.ipStreamsDynamicTable?.disableButtons([ButtonType.EDIT]);
    }
    if (this.selectableMediaStreams?.length === 0) {
      this.ipStreamsDynamicTable?.disableButtons([ButtonType.ADD]);
    }
  }

  private onAddMediaIPStream(): void {
    $('#modalTransportMediaStream').modal('show');
  }

  private onEditRow(): void {
    this.localIPStream = cloneDeep(this.ipStreamsDynamicTable.selectedRow);
    this.editMode = true;
    this.updateIPStreamValid();
    this.changeDetectorRef.detectChanges();
    $('#modalTransportAddExternalIPStream').modal('show');
  }

  private onDeleteRow(): void {
    this.multipleDeletion();
  }

  private multipleDeletion(): void {
    const removedData: any[] = [];
    const len = this.ipStreamsDynamicTable.selectedRowIds.length;
    for (let i = 0; i < len; i++) {
      const selectID = this.ipStreamsDynamicTable?.selectedRowIds[i];
      const filteredResult = this.localIPStreams.filter(ipStream => {
        const idMatch = ipStream.id.toString() !== selectID.toString();
        const clientIdMatch = ipStream.clientId !== selectID.toString();
        if (!idMatch || !clientIdMatch) {
          removedData.push(ipStream); // Collect removed objects
        }
        return idMatch && clientIdMatch;
      });
      this.localIPStreams = filteredResult;
    }
    this.usedIds = this.getAllLinkedStreamIds(this.localIPStreams);
    this.ipStreamsChanged.emit(this.localIPStreams);
    this.handleRemovedData(removedData);
    this.updateSelectableMediaStreams();
  }

  // Example method to handle removed data
  private handleRemovedData(removedData: any[]): void {
    this.deletedData = removedData;
  }

  private onAddExternalIPStream(): void {
    this.localIPStream = new DefaultATSC3Stream();
    this.editMode = false;
    this.updateIPStreamValid();
    this.changeDetectorRef.detectChanges();
    $('#modalTransportAddExternalIPStream').modal('show');
  }

  private updateIPStreamValid(): void {
    this.updateModelTitle();
    this.updateNameValid();
    this.updateDestinationAddressValid();
    this.updateDestinationPortValid();
    this.updateServiceIdValid();
    this.updateSourceAddressValid();
    this.updateOkEnabled();
  }

  private updateModelTitle(): void {
    const name = this.localIPStream.name || '';
    this.modalTitle =
      (this.editMode ? 'Edit ' : 'Add ') + ' IPStream ' +
      (this.localIPStream.name?.length > 0 ? ' - ' : '') +
      name;
  }

  private updateNameValid(): void {
    this.nameValid = this.localIPStream.name?.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  private updateDestinationAddressValid(): void {
    this.destinationAddressValid = isIPAddressValid(this.localIPStream.destinationIP);
    this.destinationAddressIconText = this.destinationAddressValid ? 'text-success' : 'text-danger';
  }

  private updateDestinationPortValid(): void {
    this.destinationPortValid = inRangeCheck(this.localIPStream.destinationPort, 1, 65535);
    this.destinationPortIconText = this.destinationPortValid ? 'text-success' : 'text-danger';
  }

  private updateServiceIdValid(): void {
    this.serviceIdValid = !this.localIPStream.external || inRangeCheck(this.localIPStream.serviceId, 1, 65535);
    this.serviceIdIconText = this.serviceIdValid ? 'text-success' : 'text-danger';
  }

  private updateSourceAddressValid(): void {
    this.sourceAddressValid = !this.localIPStream.external || isIPAddressValid(this.localIPStream.sourceIP);
    this.sourceAddressIconText = this.sourceAddressValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okButtonEnabled = this.nameValid && this.destinationAddressValid && this.destinationPortValid &&
      this.serviceIdValid && this.sourceAddressValid;
  }

  private addUpdateCurrentIPStream(): void {
    console.log('addUpdateCurrentIPStream');
    this.localIPStreams = updateElementList(this.localIPStreams, this.localIPStream,
      this.editMode) as ATSC3Stream[];
    this.updateSelectableMediaStreams();
  }

  private updateSelectableMediaStreams(): void {
    const mediaStreams: MediaStream[] = this.clientMediaStreamsModel.getMediaStreams();
    this.selectableMediaStreams = mediaStreams.filter(mediaStream => {
      return !isDefined(this.localIPStreams.find(ipStream => ipStream.linkedStreamId === mediaStream.id));
    });

    this.dtvNetworkComponent.localTransports?.forEach(localTransport => {
      if (localTransport.transportType === TransportType.ATSC_3) {
        const atscTransport = localTransport as ATSC3Transport;
        if (isDefined(this.atsc3TransportStream) && atscTransport.id !== this.atsc3TransportStream.id) {
          atscTransport.serviceGroups.forEach(serviceGroup => {
            serviceGroup.ipStreams.forEach(ipStream => {
              if (ipStream.linkedStreamId === 0 || !this.localIPStreams.some(
                existingStream => existingStream.id === ipStream.linkedStreamId)) {
                const selectedMediaStream = this.selectableMediaStreams.shift();
                if (selectedMediaStream) {
                  ipStream.linkedStreamId = selectedMediaStream.id;
                }
              }
            });
          });
        }
      }
    });


    this.usedIds = this.getAllLinkedStreamIds(this.localIPStreams);
    this.getStreamIDs = this.serviceGroups.getLinkedStreams();

    this.deletedData.forEach((data) => {
      if (data.linkedStreamId !== undefined) {
        this.getStreamIDs = this.getStreamIDs.filter(
          (streamId) => streamId !== data.linkedStreamId
        );
      }
    });
    const idsToRemove = new Set<number>(this.getStreamIDs);
    this.selectableMediaStreams = this.selectableMediaStreams.filter(stream => !idsToRemove.has(stream.id));
    this.changeDetectorRef.detectChanges();
  }

  // @ts-ignore
  public getAllLinkedStreamIds(array: any[]): number[] {
    const linkedStreamIds = array
      .filter(item => item.linkedStreamId !== undefined)
      .map(item => item.linkedStreamId);
    return linkedStreamIds;
  }

  private addMediaStream(mediaStreams: MediaStream[]): void {
    mediaStreams.forEach(mediaStream => {
      const resolvedIPStream: ATSC3Stream = new ATSC3Stream(mediaStream.serviceId, mediaStream.id,
        this.convertMediaStreamEncodingTypeToIPStreamType(mediaStream.encodingType),
        mediaStream.name, undefined, mediaStream.nic, undefined, mediaStream.slsSourcePort,
        mediaStream.dstAddress, mediaStream.dstPort, false, UNINITIALIZED_ID, uuidv4());
      this.localIPStreams = [...this.localIPStreams, resolvedIPStream];
    });
    this.updateSelectableMediaStreams();
    console.log('addMediaStream localIPStreams: ', this.localIPStreams, ', this.selectableMediaStreams: ',
      this.selectableMediaStreams);
  }

  private resolveATSC3IPStreams(unresolvedIPStreams: ATSC3Stream[]): ATSC3Stream[] {
    const resolvedATSC3IPStreams: ATSC3Stream[] = [];
    const mediaStreams: MediaStream[] = this.clientMediaStreamsModel.getMediaStreams();
    unresolvedIPStreams.forEach(unresolvedIPStream => {
      if (unresolvedIPStream.linkedStreamId > 0) {
        const foundStream: MediaStream = mediaStreams.find(
          mediaStream => mediaStream.id === unresolvedIPStream.linkedStreamId);
        if (isDefined(foundStream)) {
          const resolvedIPStream: ATSC3Stream = new ATSC3Stream(foundStream.serviceId,
            unresolvedIPStream.linkedStreamId,
            this.convertMediaStreamEncodingTypeToIPStreamType(foundStream.encodingType),
            foundStream.name, undefined, foundStream.nic, undefined, foundStream.slsSourcePort,
            foundStream.dstAddress, foundStream.dstPort, false, unresolvedIPStream.id, uuidv4());
          resolvedATSC3IPStreams.push(resolvedIPStream);
        } else {
          console.log('warning: resolveATSC3IPStreams cannot find stream id: ', unresolvedIPStream.id);
        }
      } else {
        resolvedATSC3IPStreams.push(unresolvedIPStream);
      }
    });
    return resolvedATSC3IPStreams;
  }

  private convertMediaStreamEncodingTypeToIPStreamType(encodingType: EncodingType): IPStreamType {
    return encodingType === EncodingType.ROUTE ? IPStreamType.ROUTE : IPStreamType.MMTP;
  }

  private validateIPStreamLinks(): void {
    const mediaStreams: MediaStream[] = this.clientMediaStreamsModel.getMediaStreams();
    const oldSize = this.localIPStreams.length;
    this.localIPStreams = this.localIPStreams.filter(atsc3Stream => {
      let streamValid = true;
      if (atsc3Stream.linkedStreamId > 0) {
        streamValid = isDefined(
          mediaStreams.find(mediaStream => mediaStream.id === atsc3Stream.linkedStreamId));
      }
      return streamValid;
    });
    if (oldSize !== this.localIPStreams.length) {
      this.ipStreamsChanged.emit(this.localIPStreams);
    }
  }
}
