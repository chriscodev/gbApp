// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActionMessage, ButtonType, ImageType} from '../../../../../core/models/ui/dynamicTable';
import {
  AbstractATSCService,
  AbstractService,
  DefaultATSC3Service,
  DefaultATSCCableService,
  DefaultATSCTerrestrialService,
  isATSCService,
  TranslatedService
} from '../../../../../core/models/dtv/network/logical/Service';
import {DefaultDescriptor, Descriptor} from '../../../../../core/models/dtv/network/logical/DescriptorElement';
import {timezone} from '../../../../helpers/timeZone';
import {parseHtmlEntities} from '../../../../helpers/convertDescriptorName';
import {deleteSelectedRows} from '../../../../helpers/appWideFunctions';
import * as _swal from 'sweetalert/';
import {SweetAlert} from 'sweetalert//typings/core';
import {cloneDeep} from 'lodash';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  AbstractNetwork,
  NETWORK_FOR_CHANNEL,
  NetworkTransportLinking,
  NetworkType
} from '../../../../../core/models/dtv/network/logical/Network';
import {
  AbstractATSCChannel,
  AbstractChannel,
  ChannelTransportLink,
  DefaultChannelTransportLink,
  MODULATION_TYPES,
  ModulationType
} from '../../../../../core/models/dtv/network/logical/Channel';
import {isDefined, isUndefined} from '../../../../../core/models/dtv/utils/Utils';
import {
  AbstractMPEGTransport,
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport,
  TransportType
} from '../../../../../core/models/dtv/network/physical/Transport';
import {TimeZoneMapping} from '../../../../../core/models/server/DateTime';
import {SelectTimezoneComponent} from '../../../utilities/select-timezone/select-timezone.component';
import {AbstractExtension, DefaultExtension, ExtensionType} from '../../../../../core/models/dtv/network/Extension';
import {ServerLicenseInfo} from '../../../../../core/models/server/License';
import {ClientLicenseModel} from '../../../../../core/models/ClientLicenseModel';
import {ClientNetworksModel} from '../../../../../core/models/ClientNetworksModel';
import {ClientMediaStreamsModel} from '../../../../../core/models/ClientMediaStreamsModel';
import {updateElementList} from '../../../../../core/models/AbstractElement';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {DtvNetworkComponent} from '../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {ModalNetworksAtscNetworkComponent} from '../modal-networks-atsc-network/modal-networks-atsc-network.component';
import {IPStream} from '../../../../../core/models/dtv/network/physical/stream/ip/IPStream';
import {Program} from '../../../../../core/models/dtv/network/physical/stream/mpeg/Program';
import {
  getIPStreamsList,
  getLinkedIPStream,
  getLinkedProgram,
  getUsedIPStreamIds
} from '../../../../helpers/serviceUtil';


const swal: SweetAlert = _swal as any;
declare let $: BootstrapFunction;

@Component({
  selector: 'app-modal-networks-atsc-channel',
  templateUrl: './modal-networks-atsc-channel.component.html',
  styleUrls: ['./modal-networks-atsc-channel.component.scss']
})
export class ModalNetworksAtscChannelComponent implements OnInit, OnChanges {
  @ViewChild(SelectTimezoneComponent) selectTimezone: SelectTimezoneComponent;
  @ViewChild(ModalDynamicTbTranslateComponent) channelDynamicTable: ModalDynamicTbTranslateComponent;
  @Input() networkStream: AbstractNetwork;
  @Input() allNetworks: AbstractNetwork[];
  @Input() channel: AbstractChannel;
  @Input() channels: AbstractChannel[];
  @Input() channelEditMode: boolean;
  @Input() atscNetworksChannels: AbstractATSCChannel[];
  @Output() channelChanged: EventEmitter<AbstractChannel> = new EventEmitter();
  public readonly modalNameDescriptor = '#modalAddDescriptors';
  public readonly modalNameService = '#modalAddService';
  public localChannel: AbstractATSCChannel;
  public originalChannel: AbstractATSCChannel;
  public serviceEditMode: boolean;
  public descriptorEditMode: boolean;
  public localATSCChannelServices: AbstractService[];
  public currentService: AbstractService;
  public localATSCChannelDescriptors: Descriptor[];
  public localATSCChannelExtensions: AbstractExtension[];
  public extensionEditMode: boolean;
  public clonedDescriptorExtension: any;
  public currentDescriptor: Descriptor = new DefaultDescriptor(0, true);
  public currentExtension: AbstractExtension = new DefaultExtension(ExtensionType.UNKNOWN, true);
  public isLinkDisable = false;
  public linkTransportData: AbstractTransport[];
  public timezone: any;
  public readonly MODULATION_TYPES = MODULATION_TYPES;
  public readonly modulations: ModulationType[] = Object.values(ModulationType);
  public isHiddenServiceTab = true;
  public isTimezone = false;
  public translatedServices: TranslatedService[];
  public tableHeaders = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Virtual Channel', key: 'virtualChannel', visible: true, translateField: true},
    {header: 'Linked Program', key: 'linkedProgram', visible: true, translateField: true},
  ];
  public tableHeadersDescriptor = [
    {header: 'Descriptors', key: 'descName', visible: true}
  ];
  public buttonList = [
    {
      name: ButtonType.ADD,
      imgSrc: ImageType.add,
      disable: true,
      restricted: false,
      supportsMultiSelect: true,
      alwaysEnabled: false
    },
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true, disable: true}
  ];
  public modalTitle = 'Add ATSC Channel';
  public isFromChannel = true;
  public isMajorReplaceable = true;
  public headerTabs = [];
  public activeId = 1;
  public maxServicesDisableButton = false;
  public selectedLinkTransport: AbstractTransport;
  public transportsName: string;
  public localChannels: AbstractATSCChannel[];
  private currentTransport: ChannelTransportLink[];
  private currentTimezone: TimeZoneMapping;
  private currentTZ: string;
  private serverLicenseInfo: ServerLicenseInfo;
  private serviceMax: number;
  private localNetworks: AbstractNetwork[] = [];
  private totalServicesCount: number;
  private allUnfilteredMajorArr: string[] = [];
  private nextServicePriority = 0;
  private localTransportMap: Map<string, AbstractTransport> = new Map<string, AbstractTransport>();
  private usedLinkedTransportSet = new Set<string>();
  private unusedFilteredTransportList: AbstractTransport[] = [];
  public unusedIPStreamIds: (string)[] = [];
  public unusedIPStreams: IPStream[] = [];
  public unusedProgramIds: (string)[] = [];
  public unusedPrograms: Program[] = [];

  constructor(
    private clientMediaStreamsModel: ClientMediaStreamsModel,
    private clientNetworksModel: ClientNetworksModel,
    private clientLicenseModel: ClientLicenseModel,
    private networkTransportLinking: NetworkTransportLinking,
    @Inject(ModalNetworksAtscNetworkComponent) private networkComponent: ModalNetworksAtscChannelComponent,
    @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent) {
    this.localNetworks = this.clientNetworksModel.getNetworks();
    this.serverLicenseInfo = this.clientLicenseModel.getServerLicenseInfo();
    this.serviceMax = this.serverLicenseInfo.serverLicense.maxServices;
    this.totalServicesCount = this.countAndSumServices(this.localNetworks);
  }

  public ngOnInit(): void {
    this.localChannel = cloneDeep(this.channel);
    this.localChannels = cloneDeep(this.channels);
    this.localATSCChannelServices = cloneDeep(this.localChannel.services);
    this.localATSCChannelDescriptors = cloneDeep(this.localChannel.descriptorElements);
    this.localATSCChannelExtensions = cloneDeep(this.localChannel.extensions);
    this.currentTransport = this.localChannel.transportLinks;
    this.currentService = this.createDefaultService();
    this.assignDescriptors_Extensions();
    this.assignServiceTable();
    this.setTimeZone();
    this.checkMaxService();
    this.initializeDynamicTabs();
    this.updateNextServicePriority();
    this.localTransportMap = this.networkComponent.localTransportMap;
    this.getUsedLinkedTransportIds();
    this.getFilteredTransportList();
    this.getTransportLinks();
  }

  // TODO rewrite this
  public ngOnChanges(changes: SimpleChanges) {
    this.modalTitle = 'Add ATSC Channel';
    if (isDefined(changes.channel)) {
      this.localChannel = cloneDeep(changes.channel.currentValue);
      this.localATSCChannelServices = cloneDeep(this.localChannel.services);
      this.localATSCChannelDescriptors = cloneDeep(this.localChannel.descriptorElements);
      this.localATSCChannelExtensions = cloneDeep(this.localChannel.extensions);
      if (this.localChannel.name !== '') {
        this.modalTitle = 'Edit ATSC Channel - ' + this.localChannel.name;
      }
      this.assignServiceTable();
      this.assignDescriptors_Extensions();
      if (this.channelEditMode) {
        this.resetAllServicesLink();
      }
      this.updateNextServicePriority();
    }
    if (isDefined(changes.channels)) {
      this.localChannels = cloneDeep(changes.channels.currentValue);
    }
    if (isDefined(changes.channelEditMode)) {
      this.channelEditMode = changes.channelEditMode.currentValue;
    }

    if (!this.channelEditMode) {
      this.unusedProgramIds = [];
      this.unusedPrograms = [];
      this.unusedIPStreams = [];
      this.unusedIPStreamIds = [];
    }
    this.selectedLinkTransport = null;
    this.isTimezone = this.localChannel.timeZone !== 'Select Time Zone';
    this.toggleService();
    this.setTimeZone();
    this.resetUniqueMajorArray();
    if (this.localChannel?.transportLinks?.length > 0) {
      this.selectedLinkTransport = this.localChannel?.transportLinks[0].transportId > -1 ? this.getLinkedTransport(
          this.localChannel?.transportLinks[0].transportId.toString()) :
        this.getLinkedTransport(this.localChannel.transportLinks[0].clientTransportId);
      this.transportsName = this.selectedLinkTransport !== null ? this.selectedLinkTransport.name : 'Unlinked';
      this.getTransportLinks();
    }
    this.isLinkDisable = !(this.transportsName === undefined || this.transportsName === '' || this.transportsName === 'Unlinked');
    this.originalChannel = cloneDeep(this.localChannel);
    this.getUsedLinkedTransportIds();
  }

  public showSelectedRows() {
    if (isDefined(this.channelDynamicTable) && this.activeId === 1) {
      this.channelDynamicTable.selectedRowIds = [];
      this.channelDynamicTable.selectedRows.forEach(row => {
        const checkId = isDefined(row?.clientId) ? row?.clientId : row?.id;
        this.channelDynamicTable.selectedRowIds.push(checkId);
      });
    }
  }

  public activeIdChangedHandler(id: number) {
    if (id === 1) {
      this.toggleService();
    } else {
      this.servicePriorityUpdate();
      this.toggleDescriptor();
    }
    this.activeId = id;
  }

  public onButtonClickedService(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowService();
        break;
      case ActionMessage.EDIT:
        this.onEditRowService();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowService();
        break;
    }
  }

  public serviceChangeHandler(updatedService: AbstractService) {
    this.currentService = updatedService;
    this.isFromChannel = true;
    this.localChannel.services = this.localATSCChannelServices = updateElementList(this.localATSCChannelServices,
      this.currentService, this.serviceEditMode) as AbstractService[];
    this.assignServiceTable();
    this.resetUniqueMajorArray();
    this.updateNextServicePriority();
    this.channelChanged.emit(this.localChannel);
  }

  public onButtonClickedDescriptor(event: { message: string; }) {
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

  public extensionChangeHandler(updatedExtension: AbstractExtension) {
    this.currentExtension = updatedExtension;
    this.localChannel.extensions = this.localATSCChannelExtensions = updateElementList(
      this.localATSCChannelExtensions,
      this.currentExtension, this.extensionEditMode) as AbstractExtension[];
    this.assignDescriptors_Extensions();
  }

  public descriptorChangeHandler(updatedDescriptor: Descriptor) {
    this.currentDescriptor = updatedDescriptor;
    this.localChannel.descriptorElements = this.localATSCChannelDescriptors = updateElementList(
      this.localATSCChannelDescriptors, this.currentDescriptor, this.descriptorEditMode) as Descriptor[];
    this.assignDescriptors_Extensions();
  }

  public transportLinkChangeHandler(updatedTransportLink: AbstractTransport) {
    const tempTransportLink = new DefaultChannelTransportLink();
    this.currentTransport = [];
    this.currentTransport.push(tempTransportLink);
    if (updatedTransportLink.id !== -1) {
      this.currentTransport[0].transportId = updatedTransportLink.id;
      this.unusedFilteredTransportList = this.unusedFilteredTransportList.filter(
        transport => transport.id !== updatedTransportLink.id);
    } else {
      this.currentTransport[0].clientTransportId = updatedTransportLink.clientId;
      this.unusedFilteredTransportList = this.unusedFilteredTransportList.filter(
        transport => transport.clientId !== updatedTransportLink.clientId);
    }

    this.currentTransport[0].channelId = this.localChannel.id;
    this.selectedLinkTransport = updatedTransportLink;
    this.transportsName = updatedTransportLink.name;
    this.isLinkDisable = true;
    this.getTransportLinks();
    this.linkCurrentTransport();
  }

  public closeModalNew() {
    if (this.originalChannel.transportLinks.length === 0 && this.localChannel.transportLinks.length !== 0) {
      this.unlinkConfirmation();
    }
    const timeZoneData = this.timezone.find((data: any) => data.id === this.localChannel.timeZone);
    this.localChannel.timeZone = timeZoneData?.name;
    this.isLinkDisable = false;
    this.modalTitle = 'Add ATSC Channel';
    $('#channelModal').modal('hide');
  }

  public unlinkTransport() {
    swal({
      title: 'Warning: Unlinking a transport will unlink all services contained in this channel from their corresponding programs.',
      text: 'Are you sure you want to remove the linked Transport "' + this.transportsName + '"?',
      buttons: ['cancel', 'Ok'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        this.unlinkConfirmation();
      }
    });
  }

  public clickAddEditChannel() {
    if (this.activeId === 1) {
      this.servicePriorityUpdate();
    }
    this.localChannel.timeZone = this.currentTimezone === undefined ? this.currentTZ : this.currentTimezone.timeZone;
    this.channelChanged.emit(this.localChannel);
    $('#channelModal').modal('hide');
  }

  private servicePriorityUpdate() {
    if (this.localChannel.services && this.localChannel.services.length > 0) {
      const orderedDataSource = this.channelDynamicTable.dataSource.filteredData;
      const newServiceOrder: AbstractService[] = [];
      orderedDataSource.forEach((servItem) => {
        const servObj = this.localChannel.services.find(serv => {
          return serv.id === servItem.id && serv.clientId === servItem.clientId;
        });
        newServiceOrder.push(servObj);
      });
      for (let servTrav = 0, servLength = newServiceOrder.length - 1; servTrav <= servLength; servTrav++) {
        if (newServiceOrder[servTrav]) {
          newServiceOrder[servTrav].priority = servTrav + 1;
        }
      }
      this.localChannel.services = this.localATSCChannelServices = newServiceOrder;
    }
  }

  public linkTransport() {
    this.linkTransportData = this.unusedFilteredTransportList;
    this.linkTransportData = this.linkTransportData.map(transport => {
      if (this.unusedFilteredTransportList.includes(transport)) {
        return transport;
      } else {
        return null;
      }
    }).filter(transport => transport !== null);
  }

  public updateParentHandler($event) {
    if ($event.message === 'Close') {
      if ($event.objType.timeZoneMapping !== undefined) {
        this.localChannel.timeZone = $event.objType.timeZoneMapping?.windowsName;
        this.currentTimezone = $event.objType.timeZoneMapping;
      }
      this.selectTimezone.closeModal();
    }
    this.isTimezone = this.localChannel.timeZone !== 'Select Time Zone';
  }

  private initializeDynamicTabs() {
    this.headerTabs = [
      {tabName: 'ATSC Services', activeId: 1},
      {
        tabName: this.networkStream.networkType !== 'ATSC_3' ? 'Channel Descriptors' : 'Channel Extensions',
        activeId: 2
      },
    ];
  }

  private checkMaxService() {
    this.maxServicesDisableButton = false;
    this.buttonList[0].restricted = false;
    this.buttonList[0].alwaysEnabled = true;
    if (this.totalServicesCount === this.serviceMax) {
      this.maxServicesDisableButton = true;
      this.buttonList[0].restricted = true;
      this.buttonList[0].alwaysEnabled = false;
    }
  }

  private setTimeZone() {
    this.timezone = timezone();
    this.isTimezone = this.localChannel.timeZone !== 'Select Time Zone';
    const timeZoneData = this.timezone.find((data: any) => data.id === this.localChannel.timeZone ||  data.name === this.localChannel.timeZone);
    this.localChannel.timeZone = timeZoneData?.name;
    this.currentTZ = timeZoneData?.id;
  }

  private assignServiceTable() {
    this.translatedServices = [];
    this.localATSCChannelServices?.forEach(item => {
      let translatedService = null;
      let virtualChannel = '';
      if (item.majorNumber > 0) {
        virtualChannel = item.majorNumber.toString();
        if (item.minorNumber > 0) {
          virtualChannel += '-' + item.minorNumber;
        }
      }
      this.getLinkTransport();
      let linkedProgram: any = item.physicalLink;
      if (!item.physicalLink) {
        linkedProgram = 'Unlinked';
      } else {
        let program;
        const transportId = item.physicalLink.physicalId > 0 ? item.physicalLink.physicalId.toString() : item.physicalLink.clientPhysicalId.toString();
        const tempLocalTransports: any = this.dtvNetworkComponent.transportComponent.localTransports;
        tempLocalTransports.forEach((element) => {
          if (this.networkStream.networkType === 'ATSC_3') {
            if (element.serviceGroups && element.serviceGroups.length > 0) {
              element.serviceGroups.forEach((sg) => {
                if (sg.ipStreams && sg.ipStreams.length > 0) {
                  program = sg.ipStreams.find(
                    (obj) => (obj.id && obj.id.toString() === transportId && parseInt(
                      obj.id) !== -1) || (obj.clientId && obj.clientId.toString() === transportId && parseInt(
                      obj.id) === -1));
                  if (program && program.hasOwnProperty('name')) {
                    linkedProgram = program.name;
                    return;
                  } else {
                    sg.ipStreams.forEach(ipItem => {
                      if (ipItem.hasOwnProperty('linkedStreamId')) {
                        const mediaStream = this.clientMediaStreamsModel.getMediaStreams();
                        const selectedMediaStream = mediaStream.filter(
                          x => x.id === ipItem.linkedStreamId && ipItem.id.toString() === transportId)[0];
                        if (selectedMediaStream && selectedMediaStream.hasOwnProperty('name')) {
                          linkedProgram = selectedMediaStream.name;
                          return;
                        }
                      }
                    });
                  }
                }
              });
            }
          } else {
            if (element.programs !== undefined) {
              program = element.programs.find(
                (obj) => (obj.id && obj.id.toString() === transportId && parseInt(
                  obj.id) !== -1) || (obj.clientId && obj.clientId.toString() === transportId && parseInt(
                  obj.id) === -1));
              if (program) {
                linkedProgram = program.programNumber;
              }
            }
          }
        });
      }
      if ((typeof (linkedProgram)) === 'object') {
        linkedProgram = 'Unlinked';
      }
      translatedService = new TranslatedService(virtualChannel, linkedProgram, item.id, item.clientId);
      this.translatedServices.push(translatedService);
    });
    if (this.networkStream.networkType === 'ATSC_3') {
      this.tableHeaders[1].header = 'Major-Minor';
      this.tableHeaders[2].header = 'Linked IP Stream';
    }

  }

  private assignDescriptors_Extensions() {
    let descExtensionTable: any;
    if (this.networkStream.networkType !== 'ATSC_3') {
      descExtensionTable = this.localATSCChannelDescriptors;
    } else {
      descExtensionTable = this.localATSCChannelExtensions;
    }
    descExtensionTable?.map(item => {
      const objectHolder: any = parseHtmlEntities(this.networkStream.networkType, item);
      item.descName = objectHolder.desc_name;
      item.name = objectHolder.name;
    });
    this.clonedDescriptorExtension = cloneDeep(descExtensionTable);
    if (this.networkStream.networkType !== 'ATSC_3') {
      let index = 0;
      if (this.clonedDescriptorExtension && this.clonedDescriptorExtension.length > 0) {
        this.clonedDescriptorExtension.forEach(item => {
          item.descId = item.id;
          item.descClientId = item.clientId;
          delete item.clientId;
          item.id = index;
          index++;
        });
      } else {
        this.clonedDescriptorExtension = [];
      }
    }
  }

  private onAddRowService() {
    this.serviceEditMode = false;
    this.currentService = this.createDefaultService();
    this.isFromChannel = false;
    this.isMajorReplaceable = false;
    this.totalServicesCount += 1;
    this.checkMaxService();
  }

  private onEditRowService() {
    this.serviceEditMode = true;
    this.currentService = this.channelDynamicTable.selectedRow;
    this.isFromChannel = false;
    this.isMajorReplaceable = false;
    const countOccurrences = (arr, val) => arr.filter(item => item === val).length;
    if (isATSCService(this.currentService)) {
      const atscService: AbstractATSCService = this.currentService as AbstractATSCService;
      const countOccurrences = (arr, val) => arr.filter(item => item === val).length;
      if (countOccurrences(this.allUnfilteredMajorArr, atscService.majorNumber.toString()) === 1) {
        this.isMajorReplaceable = true;
      }
    }
  }

  private onDeleteRowService() {
    // this.multipleDeletionService();
    const myCallbackFunction = (parentList, localList): void => {
      this.localChannel.services = parentList;
      this.localATSCChannelServices = localList;
      this.resetAllServicesLink();
      this.assignServiceTable();
      this.totalServicesCount -= 1;
      this.checkMaxService();
      this.resetUniqueMajorArray();
      this.updateNextServicePriority();
    };
    let selectedRow = null;
    if (isDefined(this.channelDynamicTable.selectedRow?.physicalLink)) {
      selectedRow = this.channelDynamicTable.selectedRow;
    }

    deleteSelectedRows(this.localChannel.services, this.localATSCChannelServices, this.channelDynamicTable,
      myCallbackFunction);
    if (isDefined(this.channelDynamicTable.selectedRow?.physicalLink)) {
      const linkedIPStream = getLinkedIPStream(selectedRow, this.selectedLinkTransport);

      this.channelChanged.emit(this.localChannel);
      this.serviceLinksChangedHandler({linkId: linkedIPStream.id.toString(), action: 'unlink'});
    }
  }

  private onAddRowDescriptor() {
    if (this.networkStream.networkType !== 'ATSC_3') {
      this.descriptorEditMode = false;
      this.currentDescriptor = new DefaultDescriptor(0, true);
    } else {
      this.extensionEditMode = false;
      this.currentExtension = new DefaultExtension(ExtensionType.UNKNOWN, true);
    }
  }

  private onEditRowDescriptor() {
    if (this.networkStream.networkType !== 'ATSC_3') {
      this.descriptorEditMode = true;
      this.currentDescriptor = this.localATSCChannelDescriptors[this.channelDynamicTable.selectedRowIds[0]];
    } else {
      this.extensionEditMode = true;
      this.currentExtension = this.channelDynamicTable.selectedRow;
    }
  }

  private onDeleteRowDescriptor() {
    if (this.networkStream.networkType !== 'ATSC_3') {
      const myCallbackFunction = (parentList, localList): void => {
        this.localChannel.descriptorElements = parentList;
        this.localATSCChannelDescriptors = localList;
        this.assignDescriptors_Extensions();
      };
      deleteSelectedRows(this.localChannel.descriptorElements, this.localATSCChannelDescriptors,
        this.channelDynamicTable, myCallbackFunction, true);
    } else {
      const myCallbackFunction = (parentList, localList): void => {
        this.localChannel.extensions = parentList;
        this.localATSCChannelExtensions = localList;
        this.assignDescriptors_Extensions();
      };
      deleteSelectedRows(this.localChannel.extensions, this.localATSCChannelExtensions, this.channelDynamicTable,
        myCallbackFunction);
    }
  }

  private linkCurrentTransport() {
    this.localChannel.transportLinks = this.currentTransport;
  }

  private toggleService() {
    this.isHiddenServiceTab = false;
  }

  private toggleDescriptor() {
    this.buttonList[0].disable = true;
    this.isHiddenServiceTab = true;
    if (this.networkStream.networkType === 'ATSC_3') {
      this.tableHeadersDescriptor[0].header = 'Extensions';
    } else {
      this.tableHeadersDescriptor[0].header = 'Descriptors';
    }
  }

  private unlinkConfirmation() {
    this.unusedFilteredTransportList.push(this.selectedLinkTransport);
    this.selectedLinkTransport = null;
    this.unusedIPStreams = null;
    this.unusedIPStreamIds = [];
    this.localChannel.transportLinks = [];
    //  this.isLinkDisable = false;
    this.unlinkAllServices();
  }

  private unlinkAllServices() {
    if (this.localATSCChannelServices.length > 0) {
      this.localATSCChannelServices.forEach((service: any) => {
        if (service.physicalLink && service.physicalLink.physicalId) {
          service.physicalLink = null;
        }
        if (this.networkStream.networkType === 'ATSC_3') {
          if (service.recoveryLink && service.recoveryLink.recoveryId) {
            service.recoveryLink = null;
          }
        }
      });
    }
    this.localChannel.services = this.localATSCChannelServices;
    this.assignServiceTable();
  }

  private resetAllServicesLink() {
    this.localChannel.services = this.localATSCChannelServices;
    this.assignServiceTable();
  }

  private resetUniqueMajorArray() {
    this.networkTransportLinking.majorPerNetwork = [];
    this.allUnfilteredMajorArr = [];
    if (this.allNetworks.length > 0) {
      this.allNetworks.forEach(netItem => {
        this.resetUniqueMajorArrayForAllChannels(netItem.channels);
      });
    } else {
      if (this.localChannels.length > 0) {
        this.resetUniqueMajorArrayForAllChannels(this.localChannels);
      }
    }
    this.resetUniqueMajorArrayForCurrentService();
  }

  private resetUniqueMajorArrayForAllChannels(channels: AbstractChannel[]) {
    if (channels.length > 0) {
      channels.forEach(chanItem => {
        if (!((chanItem.id === this.localChannel.id && chanItem.id !== -1) || (chanItem.clientId === this.localChannel.clientId && chanItem.id === -1))) {
          if (chanItem.services.length > 0) {
            chanItem.services.forEach((serItem: AbstractService) => {
              this.allUnfilteredMajorArr.push(serItem.majorNumber.toString());
              if (this.networkTransportLinking.majorPerNetwork.indexOf(serItem.majorNumber.toString()) === -1) {
                this.networkTransportLinking.majorPerNetwork.push(serItem.majorNumber.toString());
              }
            });
          }
        }
      });
    }
  }

  private resetUniqueMajorArrayForCurrentService() {
    if (this.localChannel.services.length > 0) {
      this.localChannel.services.forEach((serItem: AbstractService) => {
        if (isDefined(serItem.majorNumber)) {
          this.allUnfilteredMajorArr.push(serItem.majorNumber.toString());
          if (this.networkTransportLinking.majorPerNetwork.indexOf(serItem.majorNumber.toString()) === -1) {
            this.networkTransportLinking.majorPerNetwork.push(serItem.majorNumber.toString());
          }
        }
      });
    }
  }

  private countAndSumServices(arr: AbstractNetwork[]): number {
    let totalCount = 0;
    arr.forEach(item => {
      if (item.hasOwnProperty('channels')) {
        if (Array.isArray(item.channels)) {
          item.channels.forEach(channel => {
            if (channel.hasOwnProperty('services') && Array.isArray(channel.services)) {
              totalCount += channel.services.length;
            }
          });
        }
      }
    });
    return totalCount;
  }

  private updateNextServicePriority(): void {
    let maxPriority = -1;
    this.localChannel.services.forEach(service => {
      if (service.priority > maxPriority) {
        maxPriority = service.priority;
      }
    });
    this.nextServicePriority = maxPriority === -1 ? 0 : maxPriority + 1;
  }

  private createDefaultService(): AbstractService {
    let defaultService: AbstractService;
    switch (this.networkStream.networkType) {
      case NetworkType.ATSC_3:
      case NetworkType.ATSC_3_KR:
        defaultService = new DefaultATSC3Service(this.nextServicePriority);
        break;
      case NetworkType.ATSC_TERRESTRIAL:
        defaultService = new DefaultATSCTerrestrialService(this.nextServicePriority);
        break;
      case NetworkType.ATSC_CABLE:
        defaultService = new DefaultATSCCableService(this.nextServicePriority);
        break;
    }
    return defaultService;
  }

  public getLinkTransport() {
    let selectedTransport = null;
    if (this.localChannel.transportLinks != null && this.localChannel.transportLinks.length > 0) {
      selectedTransport = this.dtvNetworkComponent.transportComponent.localTransports.find(
        transport => transport.id === this.localChannel.transportLinks[0].transportId);
      this.selectedLinkTransport = selectedTransport;
      this.getTransportLinks();
    }
    return selectedTransport;
  }

  protected getLinkedTransport(transportId: string): AbstractTransport {
    return this.localTransportMap.get(transportId);
  }

  public getUsedLinkedTransportIds() {
    this.usedLinkedTransportSet.clear();
    for (const currentNetwork of this.dtvNetworkComponent.networkComponent.localNetworks) {
      for (const channel of currentNetwork?.channels) {
        for (const link of channel?.transportLinks) {
          if (link !== null) {
            if (link.transportId > 0) {
              this.usedLinkedTransportSet.add(link.transportId.toString());
            } else {
              this.usedLinkedTransportSet.add(link.clientTransportId);
            }
          }
        }
      }
    }
  }

  public getFilteredTransportList() {
    for (const [transportId, transport] of this.localTransportMap) {
      if (!this.usedLinkedTransportSet.has(transportId)) {
        if (NETWORK_FOR_CHANNEL[this.networkStream.networkType].channelTransportArrayLink.includes(
          transport.transportType)) {
          this.unusedFilteredTransportList.push(transport);
        }
      }
    }
  }

  private getUnusedIPStreams() {
    if (this.selectedLinkTransport !== null) {
      let transportStreamsList = null;
      if (this.selectedLinkTransport?.transportType === TransportType.ATSC_3_TRANSLATED) {
        const translatedTransport = this.selectedLinkTransport as ATSC3TranslatedTransport;
        transportStreamsList = getIPStreamsList(this.getOriginalTransport(translatedTransport));
      } else {
        transportStreamsList = getIPStreamsList(this.selectedLinkTransport as ATSC3Transport);
      }
      const linkedIPStreamIds = getUsedIPStreamIds(this.localChannel.services, this.currentService);
      console.log('used stream link', linkedIPStreamIds);
      let filteredStreamsList: null;
      filteredStreamsList = transportStreamsList.filter(ipStream => {
        const matchId = ipStream.id > -1 ? ipStream.id.toString() : ipStream.clientId;
        return !linkedIPStreamIds.includes(matchId);
      });

      this.unusedIPStreams = filteredStreamsList;
      this.unusedIPStreamIds = this.getUnusedIPStreamIds(filteredStreamsList);

      console.log('unsedIpStream IDs link', this.unusedIPStreamIds);
      console.log('UnusedIPStream link', this.unusedIPStreams);
    }
  }

  private getUnusedIPStreamIds(filteredStreamsList: IPStream[]) {
    return filteredStreamsList?.map(ipStream =>
      ipStream.id > -1 ? ipStream.id.toString() : ipStream.clientId
    );
  }


  private getUnUsedPrograms() {
    const programServicesMap = new Map<number, AbstractService[]>();
    if (this.selectedLinkTransport !== null) {
      this.localChannel?.services?.forEach((service: AbstractService) => {
        if (service !== this.currentService) {
          const program: Program = getLinkedProgram(service, this.selectedLinkTransport);
          if (isDefined(program)) {
            let linkedServiceList: AbstractService[] = programServicesMap.get(program.id);
            if (isUndefined(linkedServiceList)) {
              linkedServiceList = [];
              programServicesMap.set(program.id, linkedServiceList);
            }
            linkedServiceList.push(service);
          }
        }
      });

      const filteredProgramList: Program[] = [];
      const selectedTransport = this.selectedLinkTransport as AbstractMPEGTransport;
      const allowMultipleLinks = false;
      selectedTransport?.programs.forEach((program) => {
        const linkedServices: AbstractService[] = programServicesMap.get(program.id);
        if (isUndefined(linkedServices) || allowMultipleLinks) {
          filteredProgramList.push(program);
          const programId = program.id > -1 ? program.id.toString() : program.clientId;
          if (!this.unusedProgramIds.includes(programId)) {
            this.unusedProgramIds.push(programId);
          }
        }
      });

      this.unusedPrograms = filteredProgramList.filter(program => {
        const matchId = program.id > -1 ? program.id : program.clientId;
        return !this.unusedProgramIds.some(usedProgramId =>
          (usedProgramId === matchId) || (program.id <= -1 && usedProgramId === matchId)
        );
      });
      console.log('unused programs link:', this.unusedPrograms);
      console.log('unused programIds  link:', this.unusedProgramIds);

    }
  }


  public getOriginalTransport(transport: ATSC3TranslatedTransport) {
    return this.dtvNetworkComponent.transportComponent.localTransports?.find(
      (obj) => (obj.id === transport.originalTransportId && obj.id !== -1) || (obj.clientId === transport.originalClientTransportId && obj.id === -1));
  }

  public serviceLinksChangedHandler(event: { linkId: string, action: string }) {
    if (this.networkStream.networkType === NetworkType.ATSC_3) {
      if (event.action === 'link') {
        this.unusedIPStreamIds = this.unusedIPStreamIds?.filter(
          id => id !== event.linkId);
        this.unusedIPStreams = this.unusedIPStreams?.filter(
          stream => (stream.id > -1 ? stream.id.toString() !== event.linkId : stream.clientId !== event.linkId)
        );
      } else if (event.action === 'unlink') {
        this.unusedIPStreamIds.push(event.linkId);
        this.unusedIPStreams.push(this.getStreamById(event.linkId));
      }
    } else if (this.networkStream.networkType === NetworkType.ATSC_TERRESTRIAL || this.networkStream.networkType === NetworkType.ATSC_CABLE) {
      if (event.action === 'link') {
        this.unusedProgramIds = this.unusedProgramIds?.filter(
          id => id !== event.linkId);
        this.unusedPrograms = this.unusedPrograms?.filter(
          program => (program.id > -1 ? program.id.toString() !== event.linkId : program.clientId !== event.linkId)
        );
      } else if (event.action === 'unlink') {
        this.unusedProgramIds.push(event.linkId);
        this.unusedPrograms.push(this.getProgramById(event.linkId));
      }
    }
  }

  getStreamById(linkId: string) {
    // this.getUnusedIPStreams();
    return this.unusedIPStreams?.find(stream => stream.id.toString() === linkId.toString());
  }

  getProgramById(linkId: string) {
    this.getUnUsedPrograms();
    return this.unusedPrograms?.find(program => program.id.toString() === linkId.toString());
  }

  private getTransportLinks() {
    if (this.networkStream.networkType === NetworkType.ATSC_TERRESTRIAL) {
      this.getUnUsedPrograms();
      console.log(this.unusedProgramIds, '--Unused ProgramIds and Program-- ', this.unusedPrograms);
    } else if (this.networkStream.networkType === NetworkType.ATSC_3) {
      this.getUnusedIPStreams();
      console.log(this.unusedIPStreamIds, '--Unused IPStreamId and Stream-- ', this.unusedIPStreams);
    }
  }
}
