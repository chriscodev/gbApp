// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  AbstractNetwork,
  AbstractTerrestrialATSCNetwork,
  NETWORK_FOR_CHANNEL
} from '../../../../../core/models/dtv/network/logical/Network';
import {
  AbstractATSCChannel,
  AbstractChannel,
  DefaultChannel,
  TranslatedChannel
} from '../../../../../core/models/dtv/network/logical/Channel';
import {DefaultDescriptor, Descriptor} from '../../../../../core/models/dtv/network/logical/DescriptorElement';
import {ActionMessage, ButtonType, ImageType, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';

import {cloneDeep} from 'lodash';
import {parseHtmlEntities} from '../../../../helpers/convertDescriptorName';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {deleteSelectedRows} from '../../../../helpers/appWideFunctions';
import {deleteElementList, updateElementList} from '../../../../../core/models/AbstractElement';
import {DtvNetworkComponent} from '../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {createMap} from '../../../../helpers/serviceUtil';
import {AbstractTransport} from '../../../../../core/models/dtv/network/physical/Transport';

@Component({
  selector: 'app-modal-networks-atsc-network',
  templateUrl: './modal-networks-atsc-network.component.html',
  styleUrls: ['./modal-networks-atsc-network.component.scss']
})
export class ModalNetworksAtscNetworkComponent implements OnInit, OnChanges {
  @ViewChild(ModalDynamicTbTranslateComponent) networksDynamicTable: ModalDynamicTbTranslateComponent;
  @Input() networkStream: AbstractNetwork;
  @Input() allNetworks: AbstractNetwork[];
  public readonly modalNameChannel = '#channelModal';
  public readonly modalNameDescriptor = '#modalAddDescriptors';
  public atscNetworks: AbstractTerrestrialATSCNetwork;
  public localATSCNetworksChannels: AbstractChannel[];
  public localChannels: AbstractATSCChannel[];
  public translatedChannels: TranslatedChannel[];
  public currentChannel: AbstractChannel;
  public channelEditMode: boolean;
  public localATSCNetworksDescriptors: Descriptor[];
  public clonedDescriptor: any;
  public currentDescriptor: Descriptor = new DefaultDescriptor(0, true);
  public descriptorEditMode: boolean;
  public isHiddenChannelTab = false;
  public tableHeadersChannel: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Number of Services', key: 'serviceCount', visible: true, translateField: true},
    {header: 'Linked Transport', key: 'transportName', visible: true, translateField: true},
  ];
  public buttonList = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
  ];
  public tableHeadersDescriptor = [
    {header: 'Descriptors', key: 'descName', visible: true},
  ];
  public headerTabs = [
    {tabName: 'ATSC Channels', activeId: 1},
    {tabName: 'Network Descriptors', activeId: 2},
  ];
  public activeId = 1;
  private localTransportMap: Map<string, AbstractTransport> = new Map<string, AbstractTransport>();

  constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent) {
  }

  public ngOnInit(): void {
    this.initializeDynamicTabs();
    this.createTransportMap();
    this.loadChannelAndDescriptors();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.networkStream)) {
      const newNetworkStream: AbstractTerrestrialATSCNetwork = changes.networkStream.currentValue;
      this.atscNetworks = cloneDeep(newNetworkStream);
      this.localATSCNetworksDescriptors = cloneDeep(this.atscNetworks.descriptorElements);
      this.localATSCNetworksChannels = cloneDeep(this.atscNetworks.channels);
    }
  }

  public showSelectedRows() {
    if (isDefined(this.networksDynamicTable)) {
      this.networksDynamicTable.selectedRowIds = [];
      this.networksDynamicTable.selectedRows.forEach(row => {
        const checkId = isDefined(row?.clientId) ? row?.clientId : row?.id;
        this.networksDynamicTable.selectedRowIds.push(checkId);
      });
    }
  }

  public activeIdChangedHandler(id: number) {
    if (id === 1) {
      this.toggleChannel();
    } else {
      this.toggleDescriptor();
    }
    this.activeId = id;
  }

  public onButtonClickedChannel(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowChannel();
        break;
      case ActionMessage.EDIT:
        this.onEditRowChannel();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowChannel();
        break;
    }
  }

  public channelChangeHandler(updatedChannel: AbstractChannel) {
    this.currentChannel = updatedChannel;
    console.log(this.channelEditMode + 'channel', this.atscNetworks.channels);

    // special case check -- else it will duplicate and add 2 channels due to multilevel nesting
    let editMode: boolean;
    if (this.currentChannel.id > -1) {
      editMode = this.localATSCNetworksChannels.some(ch => ch.id === this.currentChannel.id);
    } else {
      editMode = this.localATSCNetworksChannels.some(ch => ch.clientId === this.currentChannel.clientId);
    }

    this.atscNetworks.channels = this.localATSCNetworksChannels = updateElementList(this.localATSCNetworksChannels,
      this.currentChannel, editMode) as AbstractChannel[];
    console.log(this.channelEditMode + 'after channel', this.atscNetworks.channels);
    this.assignChannels();
  }

  public onButtonClickedDescriptors(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowDescriptor();
        break;
      case ActionMessage.EDIT:
        this.onEditRowDescriptor();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowDescriptor();
        break;
    }
  }

  public descriptorChangeHandler(updatedDescriptor: Descriptor) {
    this.currentDescriptor = updatedDescriptor;
    this.atscNetworks.descriptorElements = this.localATSCNetworksDescriptors = updateElementList(
      this.localATSCNetworksDescriptors, this.currentDescriptor, this.descriptorEditMode) as Descriptor[];
    this.assignDescriptors();
  }

  public getLocalATSCTerrestrialNetwork(): AbstractTerrestrialATSCNetwork {
    return this.atscNetworks;
  }

  private initializeDynamicTabs() {
    if (this.networkStream.networkType === 'ATSC_3') {
      this.headerTabs = [
        {tabName: 'ATSC Channels', activeId: 1},
      ];
    }
  }

  private loadChannelAndDescriptors() {
    this.atscNetworks = this.networkStream as AbstractTerrestrialATSCNetwork;
    this.localATSCNetworksChannels = cloneDeep(this.atscNetworks.channels);
    this.localATSCNetworksDescriptors = cloneDeep(this.atscNetworks.descriptorElements);
    this.currentChannel = new DefaultChannel('', NETWORK_FOR_CHANNEL[this.atscNetworks.networkType].channelTypeValue,
      [], [], [], []);
    this.assignChannels();
    this.assignDescriptors();
  }

  private assignChannels() {
    this.localChannels = cloneDeep(this.localATSCNetworksChannels);
    this.translatedChannels = [];
    this.localChannels?.forEach(channelItem => {
      let tName = 'Unlinked';
      let translatedChannel = null;
      let serviceCount = 0;
      if (channelItem.transportLinks.length > 0) {
        const transport = channelItem?.transportLinks[0].transportId > -1 ? this.getLinkedTransport(
            channelItem?.transportLinks[0].transportId.toString()) :
          this.getLinkedTransport(channelItem.transportLinks[0].clientTransportId);
        if (transport) {
          tName = transport.name;
        }
        serviceCount = channelItem?.services?.length > 0 ? channelItem?.services?.length : 0;
        translatedChannel = new TranslatedChannel(serviceCount, tName, channelItem.id,
          channelItem.clientId);
        this.translatedChannels.push(translatedChannel);
      } else {
        translatedChannel = new TranslatedChannel(serviceCount, tName, channelItem.id,
          channelItem.clientId);
        this.translatedChannels.push(translatedChannel);
      }
    });
  }

  private assignDescriptors() {
    this.localATSCNetworksDescriptors?.map(item => {
      const objectHolder: any = parseHtmlEntities(this.networkStream.networkType, item);
      item.descName = objectHolder.desc_name;
      item.name = objectHolder.name;
    });
    this.clonedDescriptor = cloneDeep(this.localATSCNetworksDescriptors);
    let index = 0;
    if (this.clonedDescriptor && this.clonedDescriptor.length > 0) {
      this.clonedDescriptor.forEach(item => {
        item.descId = item.id;
        item.descClientId = item.clientId;
        delete item.clientId;
        item.id = index;
        index++;
      });
    }
  }

  private toggleChannel() {
    this.isHiddenChannelTab = false;
  }

  private toggleDescriptor() {
    this.isHiddenChannelTab = true;
    this.assignDescriptors();
  }

  private onAddRowChannel() {
    this.channelEditMode = false;
    this.currentChannel = new DefaultChannel('', NETWORK_FOR_CHANNEL[this.atscNetworks.networkType].channelTypeValue,
      [], [], [], []);
    // this.networkTransportLinking.setLinkedTransportsName(undefined);
    // this.networkTransportLinking.setLinkedTransport(undefined);
  }

  private onEditRowChannel() {
    this.channelEditMode = true;
    this.currentChannel = this.networksDynamicTable.selectedRow;
    // this.networkTransportLinking.setLinkedTransportsName(
    //   this.translatedChannels[this.networksDynamicTable.currentIndex].transportName);
  }

  private onDeleteRowChannel() {
    this.atscNetworks.channels = this.localATSCNetworksChannels = deleteElementList(this.localATSCNetworksChannels,
      this.networksDynamicTable) as AbstractChannel[];
    this.assignChannels();
  }

  private onAddRowDescriptor() {
    this.descriptorEditMode = false;
    this.currentDescriptor = new DefaultDescriptor(0, true);
  }

  private onEditRowDescriptor() {
    this.descriptorEditMode = true;
    this.currentDescriptor = this.localATSCNetworksDescriptors[this.networksDynamicTable.selectedRowIds[0]];
  }

  private onDeleteRowDescriptor() {
    const myCallbackFunction = (parentList, localList): void => {
      this.atscNetworks.descriptorElements = parentList;
      this.localATSCNetworksDescriptors = localList;
      this.assignDescriptors();
    };
    deleteSelectedRows(this.atscNetworks.descriptorElements, this.localATSCNetworksDescriptors,
      this.networksDynamicTable, myCallbackFunction, true);
  }

  private createTransportMap() {
    this.localTransportMap = createMap(this.dtvNetworkComponent.transportComponent.localTransports);
  }

  protected getLinkedTransport(transportId: string): AbstractTransport {
    return this.localTransportMap.get(transportId);
  }
}
